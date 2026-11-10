import { Component, signal, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { errorMessage } from '../../../../core/api/error-messages';
import { ToastService } from '../../../../core/notify/toast.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(NonNullableFormBuilder);

  showPassword = signal(false);
  capsLock = signal(false);
  loading = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null); // wrong username / password

  form = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  showError(name: 'username' | 'password') {
    const c = this.form.controls[name];
    return c.invalid && (this.submitted() || (c.touched && c.dirty));
  }

  checkCaps(e: KeyboardEvent) {
    this.capsLock.set(e.getModifierState?.('CapsLock') ?? false);
  }

  submit() {
    this.submitted.set(true);
    this.error.set(null);

    if (this.form.invalid || this.loading()) return;

    const { username, password, rememberMe } = this.form.getRawValue();
    this.loading.set(true);

    this.auth
      .login({ username: username.trim(), password }, rememberMe)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.returnUrl()),
        error: (e) => {
          this.toast.error('Fail login', errorMessage(e));
          this.error.set(errorMessage(e));
          this.form.controls.password.reset();
        },
      });
  }

  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url?.startsWith('/') && !url.startsWith('//') && !url.startsWith('/auth')
      ? url
      : '/dashboard';
  }
}
