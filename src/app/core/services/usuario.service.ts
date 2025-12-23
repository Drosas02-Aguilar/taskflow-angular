import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Result, Usuario } from "../../shared/models";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private apiUrl = `${environment.apiUrl}/usuario`;
    private authService = inject(AuthService);
    private http = inject(HttpClient);

    private get idUsuario(): number | null {
        return this.authService.idUsuario;
    }



    obtenerPerfil(): Observable<Result<Usuario>> {
        return this.http.get<Result<Usuario>>(`${this.apiUrl}/${this.idUsuario}`);
    }

    actualizarUsuario(cambios: Partial<Usuario>): Observable<Result<Usuario>> {
        return this.http.patch<Result<Usuario>>(`${this.apiUrl}/actualizar/${this.idUsuario}`, cambios);
    }

    eliminarUsuario(): Observable<Result<void>> {
        return this.http.delete<Result<void>>(`${this.apiUrl}/eliminar/${this.idUsuario}`);
    }



}

