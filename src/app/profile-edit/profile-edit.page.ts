import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

interface User {
  email: string;
  role: string;
}

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnInit {
  users: User[] = [
    { email: 'admin@example.com', role: 'admin' },
    { email: 'user@example.com', role: 'user' }
  ];
  
  newUser: User = { email: '', role: 'user' };
  selectedUser: User | null = null;
  currentUserEmail: string = '';
  newPassword: string = '';

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.currentUserEmail = this.authService.userEmail;
    console.log("Usuario autenticado:", this.authService.userEmail);
    console.log("Rol del usuario:", this.authService.userRole);
  }

  checkLoginStatus() {
    if (!this.authService.isLoggedIn) {
      this.navCtrl.navigateRoot('/home');
      this.presentToast('Acceso denegado. Por favor, inicie sesión.');
    } else if (this.authService.userRole !== 'admin' && this.authService.userRole !== 'user') {
      this.navCtrl.navigateRoot('/home');
      this.presentToast('Acceso denegado. Rol no válido.');
    }
  }

  selectUser(user: User) {
    if (this.authService.userRole === 'admin') {
      this.selectedUser = { ...user };
    } else {
      this.presentToast('Solo los administradores pueden seleccionar usuarios.');
    }
  }

  saveUser() {
    if (this.authService.userRole === 'admin' && this.selectedUser) {
      const index = this.users.findIndex(u => u.email === this.selectedUser?.email);
      if (index > -1) {
        this.users[index].role = this.selectedUser.role;
        this.presentToast('Rol de usuario actualizado.');
      }
    } else if (this.authService.userRole === 'user' && this.currentUserEmail === this.selectedUser?.email) {
      this.presentToast('Contraseña actualizada.');
    } else {
      this.presentToast('No tiene permiso para realizar esta acción.');
    }
    this.resetForm();
  }

  deleteUser(email: string) {
    if (this.authService.userRole === 'admin') {
      this.users = this.users.filter(user => user.email !== email);
      this.presentToast('Usuario eliminado.');
    } else {
      this.presentToast('Solo los administradores pueden eliminar usuarios.');
    }
  }

  resetForm() {
    this.newUser = { email: '', role: 'user' };
    this.selectedUser = null;
    this.newPassword = '';
  }

  updateRole(role: string) {
    if (this.authService.userRole === 'admin' && this.selectedUser) {
      this.selectedUser.role = role;
    }
  }

  updatePassword() {
    if (this.authService.userRole === 'user' && this.currentUserEmail === this.authService.userEmail) {
      this.presentToast('Contraseña actualizada.');
      this.newPassword = '';
    } else {
      this.presentToast('No tiene permiso para cambiar esta contraseña.');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }
}
