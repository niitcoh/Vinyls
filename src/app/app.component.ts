import { Component } from '@angular/core';
import { NavController, MenuController, Platform } from '@ionic/angular';
import { AuthService } from './services/auth.service';
import { DatabaseService } from './services/database.service';
import { firstValueFrom } from 'rxjs';

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
      await firstValueFrom(this.databaseService.isDatabaseReady());
      console.log('Base de datos lista');
      
      // Insertar datos de prueba
      const datosInsertados = await firstValueFrom(this.databaseService.insertSeedData());
      if (datosInsertados) {
        console.log('Datos de prueba insertados correctamente');
      } else {
        console.log('Los datos de prueba ya existen o no se pudieron insertar');
      }
      
      // Aquí puedes agregar lógica adicional de inicialización
    } catch (error) {
      console.error('Error al inicializar la aplicación', error);
      // Manejar el error, tal vez mostrar un mensaje al usuario
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