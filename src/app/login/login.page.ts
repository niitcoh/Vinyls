import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: string = '';
  password: string = '';

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    private databaseService: DatabaseService,
    private authService: AuthService
  ) {
    this.initializeAdmin();
  }

  private async initializeAdmin() {
    try {
      // Primero verificamos si existe el usuario admin por username
      const adminUser = await firstValueFrom(
        this.databaseService.authenticateUser('admin', 'Admin123')
      );

      if (!adminUser) {
        // Verificamos si el email ya está en uso
        const users = await firstValueFrom(this.databaseService.getUsers());
        const emailExists = users.some(user => 
          user.email?.toLowerCase() === 'admin@example.com'
        );

        if (!emailExists) {
          const defaultAdmin: Partial<User> = {
            username: 'admin',
            password: 'Admin123',
            role: 'admin',
            name: 'Administrador',
            email: 'admin@example.com',
            phoneNumber: ''
          };

          try {
            await firstValueFrom(
              this.databaseService.createUser(defaultAdmin as User)
            );
            console.log('Usuario admin creado exitosamente');
          } catch (error) {
            console.error('Error al crear usuario admin:', error);
            // Solo mostramos el toast si realmente necesitábamos crear el admin
            await this.presentToast('Error al crear usuario administrador', 'danger');
          }
        } else {
          console.log('No se creó el admin porque el email ya está en uso');
        }
      } else {
        console.log('El usuario admin ya existe');
      }
    } catch (error) {
      console.error('Error en la inicialización del admin:', error);
    }
  }

  async login() {
    if (!this.username || !this.password) {
      await this.presentToast('Por favor, complete todos los campos', 'warning');
      return;
    }

    this.databaseService.authenticateUser(this.username, this.password).subscribe({
      next: async (user) => {
        if (user) {
          this.authService.login(user.username, user.role);
          await this.presentToast('Inicio de sesión exitoso', 'success');
          setTimeout(() => {
            this.navCtrl.navigateRoot('/home');
          }, 1000);
        } else {
          await this.presentToast('Usuario o contraseña incorrectos', 'danger');
        }
      },
      error: async (error) => {
        console.error('Error durante el login:', error);
        await this.presentToast('Error al iniciar sesión', 'danger');
      }
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  goToRegister() {
    this.navCtrl.navigateForward('/register');
  }
}