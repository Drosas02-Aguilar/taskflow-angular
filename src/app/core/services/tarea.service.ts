import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Result, Tarea, EstadoTarea } from '../../shared/models';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'

})

export class TareaService {
    private apiUrl = `${environment.apiUrl}/tareas`;
    private authService = inject(AuthService);
    private http = inject(HttpClient);

    private get idUsuario(): number | null {
        return this.authService.idUsuario;
    }

    listarTareas(): Observable<Result<Tarea>> {
        return this.http.get<Result<Tarea>>(`${this.apiUrl}/listadoTareas/${this.idUsuario}`);
    }

    obtenerTarea(idTarea: number): Observable<Result<Tarea>> {
        return this.http.get<Result<Tarea>>(`${this.apiUrl}/usuario/${this.idUsuario}/${idTarea}`);
    }

    crearTarea(tarea: Tarea): Observable<Result<Tarea>> {
        return this.http.post<Result<Tarea>>(`${this.apiUrl}/usuario/${this.idUsuario}`, tarea);
    }

    actualizarTarea(idTarea: number, tarea: Tarea): Observable<Result<Tarea>> {
        return this.http.put<Result<Tarea>>(`${this.apiUrl}/usuario/${this.idUsuario}/${idTarea}`, tarea);
    }

    cambiarEstado(idTarea: number, estado: EstadoTarea): Observable<Result<Tarea>> {
        return this.http.patch<Result<Tarea>>(
            `${this.apiUrl}/usuario/${this.idUsuario}/${idTarea}/estado`,
            { estado }
        );
    }

}