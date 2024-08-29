import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  users: { email: string, password: string }[] = [];

  constructor(private navCtrl: NavController) {}

  register() {
    // Verificar si los campos están vacíos
    if (!this.email || !this.password || !this.confirmPassword) {
      alert('Por favor, rellene todos los campos');
      return;
    }

    // Verificar si las contraseñas coinciden
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Verificar si el usuario ya existe
    const userExists = this.users.some(user => user.email === this.email);

    if (userExists) {
      alert('Este usuario ya está registrado');
    } else {
      this.users.push({ email: this.email, password: this.password });
      alert('Registro exitoso');
      this.navCtrl.navigateForward('/login');
    }
  }
}

