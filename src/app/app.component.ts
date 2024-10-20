import { Component } from '@angular/core';
import { NavController, MenuController, Platform } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { DatabaseService } from './services/database.service';

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
    private authService: AuthService,
    private databaseService: DatabaseService,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    try {
      await this.platform.ready();
      await this.databaseService.isDatabaseReady().toPromise();
      // La base de datos está lista, puedes continuar con la inicialización de la app
      console.log('Database is ready');
      // Aquí puedes agregar cualquier lógica adicional que necesites ejecutar después de que la base de datos esté lista
    } catch (error) {
      console.error('Error initializing app', error);
      // Manejar el error, quizás mostrar un mensaje al usuario
    }
  }

  // Método para cerrar sesión
  logout() {
    this.authService.logout();
    this.navCtrl.navigateRoot('/home');
    this.menuCtrl.close();
  }

  closeMenu() {
    this.menuCtrl.close();
  }
}