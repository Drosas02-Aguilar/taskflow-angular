import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  emailSent = signal(false);

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.correct || response.status === 200) {
          this.emailSent.set(true);
          this.successMessage.set('Hemos enviado un enlace de recuperación a tu correo electrónico.');
        } else {
          this.errorMessage.set(response.errorMessage || 'No se encontró una cuenta con ese correo');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.errorMessage || 'Error al procesar la solicitud');
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.forgotForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  resetForm(): void {
    this.emailSent.set(false);
    this.forgotForm.reset();
    this.clearMessages();
  }
}