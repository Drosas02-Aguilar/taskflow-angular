import { Component, inject, signal, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { UsuarioService } from "../../../core/services/usuario.service";
import { Usuario } from "../../../shared/models";


@Component({
    selector: 'app-editar',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './editar.component.html',
    styleUrl: './editar.component.scss'

})

export class EditarComponent implements OnInit {

    private form = inject(FormBuilder);
    private authService = inject(AuthService);
    private usuarioService = inject(UsuarioService);
    private router = inject(Router)

    editForm: FormGroup;
    loading = signal(false);
    loadingUser = signal(true);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    get username(): string | null {
        return this.authService.username;
    }

    constructor() {
        this.editForm = this.form.group({
            nombre: [''],
            username: [''],
            email: [{ value: '', disabled: true }]
        });
    }

    ngOnInit(): void {
        this.cargarUsuario();
    }

    cargarUsuario(): void {
        this.usuarioService.obtenerPerfil().subscribe({
            next: (response) => {
                this.loadingUser.set(false);
                if (response.status && response.object) {
                    const usuario = response.object;
                    this.editForm.patchValue({
                        nombre: usuario.nombre,
                        username: usuario.username,
                    });
                    this.editForm.get('email')?.setValue(usuario.email);
                } else {
                    this.errorMessage.set('Error al cargar los datos del usuario');
                }
            },

            error: () => {
                this.loadingUser.set(false);
                this.errorMessage.set('Error al cargar');
            }
        });
    }

    onSubmit(): void {
        const cambios: Partial<Usuario> = {};
        const nombre = this.editForm.get('nombre')?.value.trim();
        const newUsername = this.editForm.get('username')?.value?.trim();

        if (nombre) cambios.nombre = nombre;
        if (newUsername) cambios.username = newUsername;

        if (Object.keys(cambios).length === 0) {
            this.errorMessage.set('Debes modificar al menos un campo')
            return;
        }

        if (newUsername && newUsername.length < 3) {
            this.errorMessage.set('El nombre de usuario debe tener al menos 3 caracteres')
            return;
        }

        this.loading.set(true);
        this.clearMessages();

        this.usuarioService.actualizarUsuario(cambios).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (response.status) {
                    if (cambios.username) {
                        this.authService.updateUsername(cambios.username);
                    }
                    this.successMessage.set('Perfil actualizado correctamente');
                    setTimeout(() => this.router.navigate(['/usuario/perfil']), 2000);
                } else {
                    this.errorMessage.set(response.errorMessage || 'Error al actualizar perfil');
                }
            },
            error: (error) => {
                this.loading.set(false);
                this.errorMessage.set(error.error?.errorMessage || 'Ocurrio un error');
            }
        });
    }

    private clearMessages(): void{
        this.errorMessage.set(null);
        this.successMessage.set(null);
    }

    logout(): void{
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

}