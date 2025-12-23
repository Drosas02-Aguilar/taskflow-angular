import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { UsuarioService } from "../../../core/services/usuario.service";
import { Usuario } from "../../../shared/models";

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './perfil.component.html',
    styleUrl: './perfil.component.scss'
})

export class PerfilComponent implements OnInit {

    private authService = inject(AuthService);
    private usuarioService = inject(UsuarioService);
    private router = inject(Router);

    usuario = signal<Usuario | null>(null);
    loading = signal(true);
    errorMessage = signal<string | null>(null);

    showConfirmDelete = signal(false);
    deletingAccount = signal(false);

    get username(): string | null {
        return this.authService.username;
    }

    ngOnInit(): void {
        this.CargarUsuario();
    }

    CargarUsuario(): void {
        this.usuarioService.obtenerPerfil().subscribe({
            next: (response) => {
                this.loading.set(false);
                if (response.status && response.object) {
                    this.usuario.set(response.object)
                } else {
                    this.errorMessage.set('Error al cargar perfil')
                }
            },

            error: (error) => {
                this.loading.set(false);
                this.errorMessage.set(error.error?.errorMessage || 'Un error ha ocurrido');
            }
        });
    }

    confirmarEliminar(): void {
        this.showConfirmDelete.set(true);
    }

    cancelarEliminar(): void {
        this.showConfirmDelete.set(false);
    }

    eliminarCuenta(): void {
        this.deletingAccount.set(true);

        this.usuarioService.eliminarUsuario().subscribe({
            next: (response) => {
                this.deletingAccount.set(false);
                if (response.status) {
                    this.authService.logout();
                    this.router.navigate(['/auth/login']);
                } else {
                    this.errorMessage.set(response.errorMessage || 'Error al eliminar cuenta');
                    this.showConfirmDelete.set(false);
                }
            },
            error: (error) => {
                this.deletingAccount.set(false);
                this.errorMessage.set(error.error?.errorMessage || 'Error inesperado');
                this.showConfirmDelete.set(false);
            }
        });
    }

    logout(): void{
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

}