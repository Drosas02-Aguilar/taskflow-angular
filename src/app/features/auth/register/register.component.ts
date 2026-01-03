import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  private form = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  loading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  passwordStrength = signal<{ level: number; text: string; color: string }>({
    level: 0,
    text: '',
    color: ''
  });

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.form.group({
      nombre:['',[
        Validators.required,
        Validators.minLength(3),
        this.soloLetrasValidator()
      ]],

      username:['',[
        Validators.required,
        Validators.minLength(3),
        this.usernameValidator()
      ]],

      email:['',[
        Validators.required,
        Validators.email
      ]],

      password:['',[
        Validators.required,
        Validators.minLength(6)
      ]]

    });

    this.registerForm.get('password')?.valueChanges.subscribe(value =>{
      this.passwordStrength.set(this.calculateStrength(value||''));
    });

  }

  private soloLetrasValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      // Solo permite letras (incluyendo acentos) y espacios
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
      if (!regex.test(value)) {
        return { soloLetras: true };
      }
      return null;
    };
  }

  private usernameValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const regexInicio = /^[a-zA-Z]/;
      if (!regexInicio.test(value)) {
        return { usernameInvalido: true };
      }
      
      const regexCompleto = /^[a-zA-Z][a-zA-Z0-9_]*$/;
      if (!regexCompleto.test(value)) {
        return { usernameCaracteres: true };
      }
      
      return null;
    };
  }

   togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.correct || response.status === 200 || response.status === 201) {
          this.successMessage.set('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.');
          this.registerForm.reset();
          this.passwordStrength.set({ level: 0, text: '', color: '' });
          setTimeout(() => this.router.navigate(['/auth/login']), 3000);
        } else {
          this.errorMessage.set(response.errorMessage || 'Error al registrar usuario');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.errorMessage || 'Error al registrar usuario');
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
private calculateStrength(password: string): { level: number; text: string; color: string } {
    if (!password) {
      return { level: 0, text: '', color: '' };
    }

    let score = 0;

    // Longitud
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;

    // Mayúsculas
    if (/[A-Z]/.test(password)) score++;

    // Minúsculas
    if (/[a-z]/.test(password)) score++;

    // Números
    if (/[0-9]/.test(password)) score++;

    // Caracteres especiales
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { level: 1, text: 'Débil', color: '#dc3545' };
    } else if (score <= 4) {
      return { level: 2, text: 'Media', color: '#ffc107' };
    } else {
      return { level: 3, text: 'Fuerte', color: '#28a745' };
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string): string {
    const control = this.registerForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'Correo electrónico inválido';
      if (control.errors['soloLetras']) return 'Solo se permiten letras';
      if (control.errors['usernameInvalido']) return 'Debe comenzar con una letra';
      if (control.errors['usernameCaracteres']) return 'Solo letras, números y guion bajo (_)';
    }
    return '';
  }



}