import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService, TareaService } from '../../../core/services';
import { Tarea, EstadoTarea } from '../../../shared/models';

@Component({
  selector: 'app-tarea-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './tarea-form.component.html',
  styleUrl: './tarea-form.component.scss'
})
export class TareaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tareaService = inject(TareaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tareaForm!: FormGroup;
  loading = signal(false);
  loadingTarea = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  isEditMode = signal(false);
  tareaId = signal<number | null>(null);

  // Fecha mínima = hoy (formato YYYY-MM-DD)
  minDate = new Date().toISOString().split('T')[0];

  get username(): string | null {
    return this.authService.username;
  }

  get tituloLength(): number {
    const value = this.tareaForm.get('titulo')?.value;
    return typeof value === 'string' ? value.length : 0;
  }

  get descripcionLength(): number {
    const value = this.tareaForm.get('descripcion')?.value;
    return typeof value === 'string' ? value.length : 0;
  }

  ngOnInit(): void {
    this.initForm();
    
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.tareaId.set(+id);
      this.cargarTarea(+id);
    }
  }

  private initForm(): void {
    this.tareaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(150)]],
      fechafin: ['', [Validators.required]],
      estado: ['PENDIENTE' as EstadoTarea, [Validators.required]]
    });
  }

  cargarTarea(id: number): void {
    this.loadingTarea.set(true);

    this.tareaService.obtenerTarea(id).subscribe({
      next: (response) => {
        this.loadingTarea.set(false);
        
        if (response.status === 200 && response.object) {
          const tarea = response.object;
          
          this.tareaForm.setValue({
            titulo: tarea.titulo || '',
            descripcion: tarea.descripcion || '',
            fechafin: tarea.fechafin || '',
            estado: tarea.estado || 'PENDIENTE'
          });
        } else {
          this.errorMessage.set('No se pudo cargar la tarea');
          setTimeout(() => this.router.navigate(['/tareas']), 2000);
        }
      },
      error: () => {
        this.loadingTarea.set(false);
        this.errorMessage.set('Error al cargar la tarea');
        setTimeout(() => this.router.navigate(['/tareas']), 2000);
      }
    });
  }

  onSubmit(): void {
    if (this.tareaForm.invalid) {
      this.tareaForm.markAllAsTouched();
      return;
    }

    // Validar fecha no sea del pasado (solo para crear)
    if (!this.isEditMode()) {
      const fechaSeleccionada = new Date(this.tareaForm.get('fechafin')?.value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaSeleccionada < hoy) {
        this.errorMessage.set('La fecha límite no puede ser anterior a hoy');
        return;
      }
    }

    this.loading.set(true);
    this.clearMessages();

    const tarea: Tarea = {
      titulo: this.tareaForm.get('titulo')?.value,
      descripcion: this.tareaForm.get('descripcion')?.value,
      fechafin: this.tareaForm.get('fechafin')?.value,
      estado: this.tareaForm.get('estado')?.value
    };

    const request = this.isEditMode()
      ? this.tareaService.actualizarTarea(this.tareaId()!, tarea)
      : this.tareaService.crearTarea(tarea);

    request.subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.status === 200) {
          const mensaje = this.isEditMode() 
            ? 'Tarea actualizada correctamente' 
            : 'Tarea creada correctamente';
          this.successMessage.set(mensaje);
          
          this.router.navigate(['/tareas'],{
            queryParams: {success: mensaje }
          });
        } else {
          this.errorMessage.set(response.errorMessage || 'Error al guardar la tarea');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.errorMessage || 'Error al guardar la tarea');
      }
    });
  }

  private clearMessages(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.tareaForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string): string {
    const control = this.tareaForm.get(field);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es requerido';
      if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}