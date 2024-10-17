import { Component } from '@angular/core';
import { NavController, MenuController } from '@ionic/angular';
import { AuthService } from './services/auth.service'; // Importar el AuthService

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  static isLoggedIn: boolean = false;
  static userRole: string = '';
  static userName: string = '';

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  get isAdmin(): boolean {
    return this.authService.userRole === 'admin';
  }

  get isUser(): boolean {
    return this.authService.userRole === 'user';
  }

  get userName(): string {
    return this.authService.userEmail;
  }

  constructor(
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private authService: AuthService  
  ) {}

  // Metodo para cerrar sesión
  logout() {
    this.authService.logout();
    this.navCtrl.navigateRoot('/home');
    this.menuCtrl.close();
  }

  closeMenu() {
    this.menuCtrl.close();
  }
}
