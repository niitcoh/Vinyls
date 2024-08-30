import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
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

  constructor(private navCtrl: NavController) {}

  login() {
    const user = this.users.find(user => user.email === this.email && user.password === this.password);

    if (user) {
      AppComponent.login(user.role);
      alert('Inicio de sesión exitoso');
      this.navCtrl.navigateForward('/home');
    } else {
      alert('Correo electrónico o contraseña incorrectos');
    }
  }
}