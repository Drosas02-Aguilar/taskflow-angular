import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm: FormGroup;
  token = '';
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.router.navigate(['/auth/login']);
    }
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }

  passwordMismatch(): boolean {
    const newPass = this.resetForm.get('newPassword')?.value;
    const confirm = this.resetForm.get('confirmPassword')?.value;
    return confirm && newPass !== confirm;
  }

  onSubmit(): void {
    if (this.resetForm.invalid || this.passwordMismatch()) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.resetPassword(this.token, this.resetForm.value.newPassword).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.correct || response.status === 200) {
          this.router.navigate(['/auth/login'], {
            queryParams: { success: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' }
          });
        } else {
          this.errorMessage.set(response.errorMessage || 'Token inválido o expirado');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.errorMessage || 'Error al restablecer contraseña');
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.resetForm.get(field);
    return !!(control && control.invalid && control.touched);
  }
}