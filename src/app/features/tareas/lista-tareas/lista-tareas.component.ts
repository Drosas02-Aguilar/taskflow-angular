import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, TareaService } from '../../../core/services';
import { Tarea, EstadoTarea } from '../../../shared/models';

@Component({
  selector: 'app-lista-tareas',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lista-tareas.component.html',
  styleUrl: './lista-tareas.component.scss'
})
export class ListaTareasComponent implements OnInit {
  private authService = inject(AuthService);
  private tareaService = inject(TareaService);
  private router = inject(Router);

  // Estado
  tareas = signal<Tarea[]>([]);
  loading = signal(true);
  
  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error' | 'info'>('success');
  
  // Filtros
  filtroEstado = signal<EstadoTarea | 'TODOS'>('TODOS');
  ordenarPor = signal<string>('fecha-desc');
  fechaDesde = signal<string>('');
  fechaHasta = signal<string>('');

  // Modal detalle
  tareaSeleccionada = signal<Tarea | null>(null);

  // Estadísticas
  estadisticas = computed(() => {
    const todas = this.tareas();
    return {
      total: todas.length,
      pendientes: todas.filter(t => t.estado === 'PENDIENTE').length,
      iniciadas: todas.filter(t => t.estado === 'INICIADA').length,
      completadas: todas.filter(t => t.estado === 'COMPLETADA').length
    };
  });

  // Tareas filtradas y ordenadas
  tareasFiltradas = computed(() => {
    let resultado = [...this.tareas()];

    // Filtrar por estado
    if (this.filtroEstado() !== 'TODOS') {
      resultado = resultado.filter(t => t.estado === this.filtroEstado());
    }

    // Filtrar por fecha desde
    if (this.fechaDesde()) {
      const desde = new Date(this.fechaDesde());
      resultado = resultado.filter(t => {
        const fecha = this.parseFecha(t.fechafin);
        return fecha && fecha >= desde;
      });
    }

    // Filtrar por fecha hasta
    if (this.fechaHasta()) {
      const hasta = new Date(this.fechaHasta() + 'T23:59:59');
      resultado = resultado.filter(t => {
        const fecha = this.parseFecha(t.fechafin);
        return fecha && fecha <= hasta;
      });
    }

    // Ordenar
    resultado.sort((a, b) => {
      const fechaA = this.parseFecha(a.fechafin);
      const fechaB = this.parseFecha(b.fechafin);
      
      switch (this.ordenarPor()) {
        case 'fecha-desc':
          if (!fechaA && !fechaB) return 0;
          if (!fechaA) return 1;
          if (!fechaB) return -1;
          return fechaB.getTime() - fechaA.getTime();
        case 'fecha-asc':
          if (!fechaA && !fechaB) return 0;
          if (!fechaA) return 1;
          if (!fechaB) return -1;
          return fechaA.getTime() - fechaB.getTime();
        default:
          return 0;
      }
    });

    return resultado;
  });

  get username(): string | null {
    return this.authService.username;
  }

  ngOnInit(): void {
    this.cargarTareas();
  }

  cargarTareas(): void {
    this.loading.set(true);

    this.tareaService.listarTareas().subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.status === 200) {
          this.tareas.set(response.objects || []);
        } else {
          this.showToast(response.errorMessage || 'Error al cargar tareas', 'error');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.showToast(error.error?.errorMessage || 'Error al cargar tareas', 'error');
      }
    });
  }

  // Cambiar estado desde dropdown
  cambiarEstado(tarea: Tarea, nuevoEstado: EstadoTarea, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!tarea.idTarea || tarea.estado === nuevoEstado) return;

    this.tareaService.cambiarEstado(tarea.idTarea, nuevoEstado).subscribe({
      next: (response) => {
        if (response.status === 200) {
          // Actualizar localmente
          this.tareas.update(tareas =>
            tareas.map(t => t.idTarea === tarea.idTarea ? { ...t, estado: nuevoEstado } : t)
          );
          this.showToast(`Estado actualizado a ${nuevoEstado}`, 'success');
        } else {
          this.showToast(response.errorMessage || 'Error al actualizar el estado', 'error');
        }
      },
      error: (error) => {
        let errorMessage = 'Error al actualizar el estado';
        if (error.status === 404) {
          errorMessage = 'Tarea no encontrada';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para realizar esta acción';
        } else if (error.status === 401) {
          errorMessage = 'Sesión expirada. Inicia sesión nuevamente';
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        }
        this.showToast(errorMessage, 'error');
      }
    });
  }

  // Modal detalle
  verDetalle(tarea: Tarea): void {
    this.tareaSeleccionada.set(tarea);
  }

  cerrarModal(): void {
    this.tareaSeleccionada.set(null);
  }

  editarDesdeModal(): void {
    const tarea = this.tareaSeleccionada();
    if (tarea?.idTarea) {
      this.router.navigate(['/tareas/editar', tarea.idTarea]);
    }
  }

  eliminarDesdeModal(): void {
    const tarea = this.tareaSeleccionada();
    if (tarea?.idTarea && confirm('¿Estás seguro de eliminar esta tarea?')) {
      this.eliminarTarea(tarea.idTarea);
      this.cerrarModal();
    }
  }

  // Eliminar tarea
  eliminarTarea(idTarea: number): void {
    this.tareaService.eliminarTarea(idTarea).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.tareas.update(tareas => tareas.filter(t => t.idTarea !== idTarea));
          this.showToast('Tarea eliminada correctamente', 'success');
        } else {
          this.showToast(response.errorMessage || 'Error al eliminar tarea', 'error');
        }
      },
      error: (error) => {
        this.showToast(error.error?.errorMessage || 'Error al eliminar tarea', 'error');
      }
    });
  }

  confirmarEliminar(tarea: Tarea, event: Event): void {
    event.preventDefault();
    if (tarea.idTarea && confirm('¿Estás seguro de eliminar esta tarea?')) {
      this.eliminarTarea(tarea.idTarea);
    }
  }

  // Filtros
  filtrarPorEstado(estado: EstadoTarea | 'TODOS'): void {
    this.filtroEstado.set(estado);
  }

  limpiarFiltros(): void {
    this.filtroEstado.set('TODOS');
    this.ordenarPor.set('fecha-desc');
    this.fechaDesde.set('');
    this.fechaHasta.set('');
    this.showToast('Filtros limpiados', 'info');
  }

  // Utilidades
  parseFecha(fechaStr: string): Date | null {
    if (!fechaStr) return null;
    
    if (fechaStr.includes('/')) {
      const parts = fechaStr.split('/');
      if (parts.length === 3) {
        return new Date(+parts[2], +parts[1] - 1, +parts[0]);
      }
    }
    if (fechaStr.includes('-')) {
      return new Date(fechaStr);
    }
    return null;
  }

  getBadgeClass(estado: EstadoTarea): string {
    const clases: Record<EstadoTarea, string> = {
      'INICIADA': 'badge-iniciada',
      'PENDIENTE': 'badge-pendiente',
      'COMPLETADA': 'badge-completada'
    };
    return clases[estado];
  }

  getEstadoIcon(estado: EstadoTarea): string {
    const iconos: Record<EstadoTarea, string> = {
      'INICIADA': 'bi-hourglass-split',
      'PENDIENTE': 'bi-clock',
      'COMPLETADA': 'bi-check-circle'
    };
    return iconos[estado];
  }

  // Toast
  showToast(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}