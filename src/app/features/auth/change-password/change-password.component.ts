import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  changeForm: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  constructor() {
    this.changeForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  get username(): string | null {
    return this.authService.username;
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  passwordMismatch(): boolean {
    const newPass = this.changeForm.get('newPassword')?.value;
    const confirm = this.changeForm.get('confirmPassword')?.value;
    return confirm && newPass !== confirm;
  }

  onSubmit(): void {
    if (this.changeForm.invalid || this.passwordMismatch()) {
      this.changeForm.markAllAsTouched();
      return;
    }

    if (!this.username) {
      this.errorMessage.set('No se pudo obtener el usuario actual');
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    this.authService.changePassword(this.username, this.changeForm.value.newPassword).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.correct || response.status === 200) {
          this.successMessage.set('¡Contraseña actualizada correctamente!');
          this.changeForm.reset();
          setTimeout(() => this.router.navigate(['/dashboard']), 2500);
        } else {
          this.errorMessage.set(response.errorMessage || 'Error al cambiar la contraseña');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.errorMessage || 'Error al cambiar la contraseña');
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.changeForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}