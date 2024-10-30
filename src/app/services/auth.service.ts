import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userEmail: string = '';
  private _userRole: string = '';
  private _isLoggedIn: boolean = false;

  constructor() {
    this.loadStoredUserData();
  }

  private loadStoredUserData() {
    const storedEmail = localStorage.getItem('userEmail');
    const storedRole = localStorage.getItem('userRole');
    const storedLoginStatus = localStorage.getItem('isLoggedIn');

    if (storedEmail && storedRole && storedLoginStatus) {
      this._userEmail = storedEmail;
      this._userRole = storedRole;
      this._isLoggedIn = storedLoginStatus === 'true';
      console.log('Datos de usuario cargados del almacenamiento:', {
        email: this._userEmail,
        role: this._userRole,
        isLoggedIn: this._isLoggedIn
      });
    }
  }

  private saveUserData() {
    localStorage.setItem('userEmail', this._userEmail);
    localStorage.setItem('userRole', this._userRole);
    localStorage.setItem('isLoggedIn', this._isLoggedIn.toString());
  }

  get userEmail(): string {
    console.log('Obteniendo email de usuario:', this._userEmail);
    return this._userEmail;
  }

  get userRole(): string {
    console.log('Obteniendo rol de usuario:', this._userRole);
    return this._userRole;
  }

  get isLoggedIn(): boolean {
    console.log('Verificando estado de login:', this._isLoggedIn);
    return this._isLoggedIn;
  }

  login(email: string, role: string) {
    console.log('Iniciando sesión con:', { email, role });
    this._userEmail = email;
    this._userRole = role;
    this._isLoggedIn = true;
    this.saveUserData();
    console.log('Sesión iniciada correctamente. Estado actual:', this.getStatus());
  }

  logout() {
    console.log('Cerrando sesión');
    this._userEmail = '';
    this._userRole = '';
    this._isLoggedIn = false;
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    console.log('Sesión cerrada. Estado actual:', this.getStatus());
  }

  private getStatus(): string {
    return `isLoggedIn: ${this._isLoggedIn}, userEmail: ${this._userEmail}, userRole: ${this._userRole}`;
  }
}