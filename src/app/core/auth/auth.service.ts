import { computed, inject, Service, signal } from '@angular/core';
import { ApiError, ApiResponse } from '../api/api.types';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api/api.config';
import { Router } from '@angular/router';
import { TokenStorageService } from './token-storage.service';
import {
  catchError,
  finalize,
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { LoginRequest, Me, TokenPair } from './auth.models';

/** 401/403 from refresh = the session is dead (bad token or account disabled). */
const sessionIsDead = (e: unknown) => e instanceof ApiError && (e.status === 401 || e.status === 403);

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private api = inject(API_URL);
  private router = inject(Router);
  private storage = inject(TokenStorageService);

  // access token: memory readonly
  private readonly token = signal<string | null>(null);
  private refreshing$: Observable<string> | null = null;

  readonly user = signal<Me | null>(null);
  readonly isLoggedIn = computed(() => this.user() != null);

  accessToken(): string | null {
    return this.token();
  }

  login(req: LoginRequest, remember: boolean): Observable<Me> {
    return this.http.post<ApiResponse<TokenPair>>(`${API_URL}/auth/login`, req).pipe(
      tap(({ data }) => this.setTokens(data, remember)),
      switchMap(() => this.loadMe()),
      catchError((e) => {
        this.clear();
        return throwError(() => e);
      }),
    );
  }

  loadMe(): Observable<Me> {
    return this.http.get<ApiResponse<Me>>(`${API_URL}/users/me`).pipe(
      map(({ data }) => data),
      tap((me) => this.user.set(me)),
    );
  }

  /**
   * Gets a new access token. Calls made at the same time share one request,
   * because the backend rotates the refresh token and a second call with the old one would fail.
   */
  refresh(): Observable<string> {
    if (this.refreshing$) return this.refreshing$;
    const stored = this.storage.get();
    if (!stored) return throwError(() => new ApiError(401, 'NO_SESSION', 'Please sign in.'));

    const send = (rt: string) =>
      this.http.post<ApiResponse<TokenPair>>(`${this.api}/auth/refresh`, { refreshToken: rt });

    this.refreshing$ = send(stored).pipe(
      catchError((e) => {
        const now = this.storage.get();
        return sessionIsDead(e) && now && now !== stored ? send(now) : throwError(() => e);
      }),
      tap(({ data }) => this.setTokens(data, this.storage.remembered())),
      map(({ data }) => data.token),
      catchError((e) => {
        if (sessionIsDead(e)) this.clear();
        return throwError(() => e);
      }),
      finalize(() => (this.refreshing$ = null)),
      shareReplay(1),
    );

    return this.refreshing$;
  }

  restore(): Promise<void> {
    if (!this.storage.get()) return Promise.resolve();
    return firstValueFrom(
      this.refresh().pipe(
        switchMap(() => this.loadMe()),
        map(() => undefined),
        catchError(() => of(undefined)), // guards will send them to the login page
      ),
    );
  }

  logout(): void {
    const rt = this.storage.get();
    this.clear();

    if (rt) {
      this.http.post(`${API_URL}/auth/logout`, { refreshToken: rt }).subscribe({ error: () => {} });
    }

    this.router.navigateByUrl('/auth/login');
  }

  expireSession(): void {
    this.clear();
    const returnUrl = this.router.url;
    this.router.navigate(['/auth/login'], {
      queryParams: returnUrl.startsWith('/auth') ? {} : { returnUrl },
    });
  }

  private setTokens(pair: TokenPair, remember: boolean): void {
    this.token.set(pair.token);
    this.storage.set(pair.refreshToken, remember);
  }

  private clear(): void {
    this.token.set(null);
    this.user.set(null);
    this.storage.clear();
  }
}
