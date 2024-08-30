import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnInit {
  users: { email: string, password: string, role: string }[] = [
    { email: 'admin', password: '1234', role: 'admin' },
    { email: 'user', password: '1234', role: 'user' }
  ];
  
  newUser = { email: '', password: '', role: 'user' };
  selectedUser: { email: string, password: string, role: string } | null = null;

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    if (!AppComponent.isLoggedIn || AppComponent.userRole !== 'admin') {
      this.navCtrl.navigateRoot('/home');
      this.presentToast('Acceso denegado. Solo administradores pueden gestionar perfiles.');
    }
  }

  selectUser(user: { email: string, password: string, role: string }) {
    this.selectedUser = { ...user };
  }

  saveUser() {
    if (this.selectedUser) {
      const index = this.users.findIndex(u => u.email === this.selectedUser?.email);
      if (index > -1) {
        this.users[index] = this.selectedUser;
      }
    } else {
      this.users.push({ ...this.newUser });
    }
    this.resetForm();
  }

  deleteUser(email: string) {
    this.users = this.users.filter(user => user.email !== email);
  }

  resetForm() {
    this.newUser = { email: '', password: '', role: 'user' };
    this.selectedUser = null;
  }

  updatePassword(password: string) {
    if (this.selectedUser) {
      this.selectedUser.password = password;
    }
  }
  
  updateRole(role: string) {
    if (this.selectedUser) {
      this.selectedUser.role = role;
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