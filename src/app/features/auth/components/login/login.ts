import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  showPassword = signal(false);
  capsLock = signal(false);
  loading = signal(false);
  submitted = signal(false);
  error = signal<string | null>(null); // wrong username / password

  showError(name: 'username' | 'password') {
    // const c = this.form.controls[name];
    // return c.invalid && (this.submitted() || (c.touched && c.dirty));
  }

  checkCaps(e: KeyboardEvent) {
    this.capsLock.set(e.getModifierState?.('CapsLock') ?? false);
  }
}
