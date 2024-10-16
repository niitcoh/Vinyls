import { Component } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';   
  password: string = '';   

  users: { email: string, password: string, role: string }[] = [
    { email: 'admin', password: '1234', role: 'admin' },
    { email: 'user', password: '1234', role: 'user' }
  ];

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController
  ) {}

  async login() {
    const user = this.users.find(user => user.email === this.email && user.password === this.password);

    if (user) {
      AppComponent.login(user.role, user.email);
      await this.presentToast('Inicio de sesión exitoso', 'success');
      this.navCtrl.navigateForward('/home');
    } else {
      await this.presentToast('Correo electrónico o contraseña incorrectos', 'danger');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }
}