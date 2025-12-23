import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Result, LoginResponse, Usuario } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  private usernameSubject = new BehaviorSubject<string | null>(this.getStoredUsername());
  private idUsuarioSubject = new BehaviorSubject<number | null>(this.getStoredIdUsuario());

  token$ = this.tokenSubject.asObservable();
  username$ = this.usernameSubject.asObservable();
  idUsuario$ = this.idUsuarioSubject.asObservable();

  constructor(private http: HttpClient) {}

  
  get token(): string | null {
    return this.tokenSubject.value;
  }

  get username(): string | null {
    return this.usernameSubject.value;
  }

  get idUsuario(): number | null {
    return this.idUsuarioSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }


  private getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  private getStoredUsername(): string | null {
    return localStorage.getItem('username');
  }

  private getStoredIdUsuario(): number | null {
    const id = localStorage.getItem('idUsuario');
    return id ? parseInt(id, 10) : null;
  }

  private saveSession(token: string, username: string, idUsuario: number): void {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('idUsuario', idUsuario.toString());
    
    this.tokenSubject.next(token);
    this.usernameSubject.next(username);
    this.idUsuarioSubject.next(idUsuario);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('idUsuario');
    
    this.tokenSubject.next(null);
    this.usernameSubject.next(null);
    this.idUsuarioSubject.next(null);
  }


  register(usuario: Usuario): Observable<Result> {
    return this.http.post<Result>(`${this.apiUrl}/register`, usuario);
  }

  verify(token: string): Observable<Result> {
    return this.http.get<Result>(`${this.apiUrl}/verify`, {
      params: new HttpParams().set('token', token)
    });
  }

  login(usuario: { username: string; password: string }): Observable<Result<LoginResponse>> {
    return this.http.post<Result<LoginResponse>>(`${this.apiUrl}/login`, usuario).pipe(
      tap(response => {
        if (response.status ===200 && response.object) {
          const { token, username, idUsuario } = response.object;
          this.saveSession(token, username, idUsuario);
        }
      })
    );
  }

  forgotPassword(email: string): Observable<Result> {
    return this.http.post<Result>(`${this.apiUrl}/forgot`, null, {
      params: new HttpParams().set('email', email)
    });
  }

  resetPassword(token: string, newPassword: string): Observable<Result> {
    const params = new HttpParams()
      .set('token', token)
      .set('newPassword', newPassword);
    return this.http.post<Result>(`${this.apiUrl}/reset`, null, { params });
  }

  changePassword(username: string, newPassword: string): Observable<Result> {
    const params = new HttpParams()
      .set('username', username)
      .set('newPassword', newPassword);
    return this.http.post<Result>(`${this.apiUrl}/change-password`, null, { params });
  }

  logout(): void {
    this.clearSession();
  }

  updateUsername(newUsername: string): void {
    localStorage.setItem('username', newUsername);
    this.usernameSubject.next(newUsername);
  }
}