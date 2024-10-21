import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userEmail: string = '';
  private _userRole: string = '';
  private _isLoggedIn: boolean = false;

  constructor() {
    console.log('AuthService inicializado');
  }

  get userEmail(): string {
    return this._userEmail;
  }

  get userRole(): string {
    return this._userRole;
  }

  get isLoggedIn(): boolean {
    return this._isLoggedIn;
  }

  login(email: string, role: string) {
    console.log('Iniciando sesión con email:', email, 'y rol:', role);
    this._userEmail = email;
    this._userRole = role;
    this._isLoggedIn = true;
    console.log('Sesión iniciada. Estado actual:', this.getStatus());
  }

  logout() {
    console.log('Cerrando sesión');
    this._userEmail = '';
    this._userRole = '';
    this._isLoggedIn = false;
    console.log('Sesión cerrada. Estado actual:', this.getStatus());
  }

  isAuthenticated(): boolean {
    console.log('Verificando autenticación. Estado:', this._isLoggedIn);
    return this._isLoggedIn;
  }

  getUserRole(): string {
    console.log('Obteniendo rol de usuario:', this._userRole);
    return this._userRole;
  }

  private getStatus(): string {
    return `isLoggedIn: ${this._isLoggedIn}, userEmail: ${this._userEmail}, userRole: ${this._userRole}`;
  }
}