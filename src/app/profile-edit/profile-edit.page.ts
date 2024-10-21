import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { DatabaseService } from '../services/database.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage implements OnInit {
  currentUser: User | null = null;
  users: User[] = [];
  newPassword: string = '';
  isAdmin: boolean = false;
  loading: boolean = false;
  photoLoading: boolean = false;

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    public authService: AuthService,
    private databaseService: DatabaseService
  ) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  async checkLoginStatus() {
    if (!this.authService.isLoggedIn) {
      await this.presentToast('Acceso denegado. Por favor, inicie sesión.');
      this.navCtrl.navigateRoot('/login');
      return;
    }

    this.isAdmin = this.authService.userRole === 'admin';
    await this.loadCurrentUser();
    if (this.isAdmin) {
      await this.loadAllUsers();
    }
  }

  async loadCurrentUser() {
    this.loading = true;
    const userEmail = this.authService.userEmail;
    
    if (!userEmail) {
      await this.presentToast('Error: No se encontró el email del usuario');
      this.loading = false;
      return;
    }

    console.log('Cargando usuario con email:', userEmail);

    this.databaseService.getUserByEmail(userEmail).subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          console.log('Usuario cargado:', this.currentUser);
        } else {
          console.error('No se encontró el usuario con el email:', userEmail);
          this.presentToast('No se pudo encontrar la información del usuario.');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar el usuario:', error);
        this.presentToast('Error al cargar la información del usuario');
        this.loading = false;
      }
    });
  }

  async loadAllUsers() {
    this.loading = true;
    this.databaseService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Usuarios cargados:', this.users);
        this.loading = false;
      },
      error: async (error) => {
        console.error('Error al cargar los usuarios:', error);
        await this.presentToast('Error al cargar la lista de usuarios');
        this.loading = false;
      }
    });
  }

  async saveUser() {
    if (!this.currentUser) {
      await this.presentToast('Error: No hay usuario para guardar');
      return;
    }

    const loading = await this.presentLoading('Guardando cambios...');

    try {
      const result = await this.databaseService.updateUser(this.currentUser).toPromise();
      if (result) {
        await this.presentToast('Perfil actualizado con éxito.');
      } else {
        throw new Error('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      await this.presentToast('Error al guardar los cambios.');
    } finally {
      loading.dismiss();
    }
  }

  async updatePassword() {
    if (!this.newPassword.trim()) {
      await this.presentToast('Por favor, ingrese una nueva contraseña.');
      return;
    }

    const loading = await this.presentLoading('Actualizando contraseña...');

    try {
      // Aquí deberías implementar la lógica para actualizar la contraseña en la base de datos
      // Por ahora, solo simularemos una actualización exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));
      await this.presentToast('Contraseña actualizada con éxito.');
      this.newPassword = '';
    } catch (error) {
      console.error('Error al actualizar la contraseña:', error);
      await this.presentToast('Error al actualizar la contraseña.');
    } finally {
      loading.dismiss();
    }
  }

  async onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.currentUser) return;

    this.photoLoading = true;
    const loading = await this.presentLoading('Cargando imagen...');

    try {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.currentUser) {
          this.currentUser.photo = e.target.result;
          this.photoLoading = false;
          loading.dismiss();
          this.presentToast('Foto actualizada con éxito.');
          this.saveUser(); // Llama a saveUser para guardar la foto en la base de datos
        }
      };
      reader.onerror = () => {
        this.photoLoading = false;
        loading.dismiss();
        this.presentToast('Error al cargar la imagen.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      this.photoLoading = false;
      loading.dismiss();
      await this.presentToast('Error al procesar la imagen.');
    }
  }

  async deleteUser(email: string) {
    if (!this.isAdmin) {
      await this.presentToast('Solo los administradores pueden eliminar usuarios.');
      return;
    }

    if (email === this.authService.userEmail) {
      await this.presentToast('No puedes eliminar tu propio usuario.');
      return;
    }

    const loading = await this.presentLoading('Eliminando usuario...');

    try {
      // Aquí deberías implementar la lógica para eliminar el usuario de la base de datos
      // Por ahora, solo simularemos una eliminación exitosa
      this.users = this.users.filter(user => user.email !== email);
      await this.presentToast('Usuario eliminado con éxito.');
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      await this.presentToast('Error al eliminar el usuario.');
    } finally {
      loading.dismiss();
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message: message,
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();
    return loading;
  }
}