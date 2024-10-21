import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { DatabaseService } from '../services/database.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  username: string = '';
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  phoneNumber: string = '';

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    private databaseService: DatabaseService
  ) {}

  async register() {
    try {
      if (!this.validateFields()) {
        return;
      }

      const newUser: User = {
        username: this.username.trim(),
        password: this.password,
        role: 'user',
        name: this.name.trim(),
        email: this.email.toLowerCase().trim(),
        phoneNumber: this.phoneNumber?.trim() || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        photo: '' // Inicializamos el campo photo como una cadena vacía
      };

      this.databaseService.createUser(newUser).subscribe({
        next: async (userId) => {
          if (userId > 0) {
            await this.presentToast('¡Registro exitoso! Ya puedes iniciar sesión', 'success');
            setTimeout(() => {
              this.navCtrl.navigateForward('/login');
            }, 1000);
          }
        },
        error: async (error) => {
          console.error('Error durante el registro:', error);
          let errorMessage = 'Error al registrar usuario';
          
          if (error.toString().includes('UNIQUE constraint failed: Users.email')) {
            errorMessage = 'Este correo electrónico ya está registrado';
          } else if (error.toString().includes('UNIQUE constraint failed: Users.username')) {
            errorMessage = 'Este nombre de usuario ya está en uso';
          }
          
          await this.presentToast(errorMessage, 'danger');
        }
      });
    } catch (error) {
      console.error('Error inesperado:', error);
      await this.presentToast('Ocurrió un error inesperado durante el registro', 'danger');
    } 
  }

  private async validateFields(): Promise<boolean> {
    if (!this.username?.trim()) {
      await this.presentToast('El nombre de usuario es obligatorio', 'warning');
      return false;
    }

    if (!this.name?.trim()) {
      await this.presentToast('El nombre es obligatorio', 'warning');
      return false;
    }

    if (!this.email?.trim()) {
      await this.presentToast('El correo electrónico es obligatorio', 'warning');
      return false;
    }

    if (!this.validateEmail(this.email)) {
      await this.presentToast('Por favor, ingresa un correo electrónico válido', 'warning');
      return false;
    }

    if (!this.password) {
      await this.presentToast('La contraseña es obligatoria', 'warning');
      return false;
    }

    if (!this.validatePassword(this.password)) {
      await this.presentToast('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número', 'warning');
      return false;
    }

    if (this.password !== this.confirmPassword) {
      await this.presentToast('Las contraseñas no coinciden', 'warning');
      return false;
    }

    return true;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,30}$/;
    return passwordRegex.test(password);
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      buttons: [{
        text: 'Cerrar',
        role: 'cancel'
      }]
    });
    await toast.present();
  }
}