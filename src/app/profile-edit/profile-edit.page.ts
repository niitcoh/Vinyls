import { Component, OnInit } from '@angular/core';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
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
  errorMessage: string = '';

  constructor(
    private navCtrl: NavController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    public authService: AuthService,
    private databaseService: DatabaseService
  ) {
    console.log('ProfileEditPage constructor');
  }

  async ngOnInit() {
    console.log('ProfileEditPage ngOnInit');
    await this.initializeProfile();
  }

  async ionViewWillEnter() {
    console.log('ProfileEditPage ionViewWillEnter');
    await this.initializeProfile();
  }

  private async initializeProfile() {
    console.log('Initializing profile');
    const loading = await this.showLoading('Cargando perfil...');

    try {
      // Esperar a que la base de datos esté lista
      await this.databaseService.waitForDatabase();
      
      // Verificar autenticación
      if (!this.authService.isLoggedIn) {
        throw new Error('Usuario no autenticado');
      }

      const userEmail = this.authService.userEmail;
      if (!userEmail) {
        throw new Error('Email de usuario no encontrado');
      }

      console.log('Loading user data for:', userEmail);
      this.isAdmin = this.authService.userRole === 'admin';

      // Cargar datos del usuario
      const user = await firstValueFrom(this.databaseService.getUserByEmail(userEmail));
      if (user) {
        this.currentUser = user;
        console.log('User data loaded:', this.currentUser);
        
        // Si es admin, cargar lista de usuarios
        if (this.isAdmin) {
          const allUsers = await firstValueFrom(this.databaseService.getUsers());
          this.users = allUsers;
          console.log('All users loaded:', this.users);
        }
      } else {
        throw new Error('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Error al cargar el perfil';
      await this.showToast(this.errorMessage);
      this.navCtrl.navigateRoot('/login');
    } finally {
      this.loading = false;
      await loading.dismiss();
    }
  }

  async saveUser() {
    if (!this.currentUser) {
      await this.showToast('Error: No hay usuario para guardar');
      return;
    }

    const loading = await this.showLoading('Guardando cambios...');

    try {
      console.log('Saving user changes:', this.currentUser);
      const result = await firstValueFrom(this.databaseService.updateUser(this.currentUser));
      if (result) {
        await this.showToast('Perfil actualizado con éxito');
      } else {
        throw new Error('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      await this.showToast('Error al guardar los cambios');
    } finally {
      await loading.dismiss();
    }
  }

  async updatePassword() {
    if (!this.newPassword.trim() || !this.currentUser?.id) {
      await this.showToast('Por favor, ingrese una nueva contraseña');
      return;
    }

    const loading = await this.showLoading('Actualizando contraseña...');

    try {
      const result = await firstValueFrom(
        this.databaseService.updateUserPassword(this.currentUser.id, this.newPassword)
      );
      
      if (result) {
        this.newPassword = '';
        await this.showToast('Contraseña actualizada con éxito');
      } else {
        throw new Error('Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      await this.showToast('Error al actualizar la contraseña');
    } finally {
      await loading.dismiss();
    }
  }

  async onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.currentUser) return;

    this.photoLoading = true;
    const loading = await this.showLoading('Cargando imagen...');

    try {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        if (this.currentUser) {
          this.currentUser.photo = e.target.result;
          this.photoLoading = false;
          await loading.dismiss();
          await this.showToast('Foto actualizada con éxito');
          await this.saveUser();
        }
      };
      reader.onerror = async () => {
        this.photoLoading = false;
        await loading.dismiss();
        await this.showToast('Error al cargar la imagen');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      this.photoLoading = false;
      await loading.dismiss();
      await this.showToast('Error al procesar la imagen');
    }
  }

  async deleteUser(email: string) {
    if (!this.isAdmin) {
      await this.showToast('Solo los administradores pueden eliminar usuarios');
      return;
    }

    if (email === this.authService.userEmail) {
      await this.showToast('No puedes eliminar tu propio usuario');
      return;
    }

    const loading = await this.showLoading('Eliminando usuario...');

    try {
      const result = await firstValueFrom(this.databaseService.deleteUser(email));
      if (result) {
        this.users = this.users.filter(user => user.email !== email);
        await this.showToast('Usuario eliminado con éxito');
      } else {
        throw new Error('No se pudo eliminar el usuario');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      await this.showToast('Error al eliminar el usuario');
    } finally {
      await loading.dismiss();
    }
  }

  // Métodos de utilidad
  private async showToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ],
      cssClass: 'custom-toast'
    });
    await toast.present();
  }

  private async showLoading(message: string) {
    const loading = await this.loadingController.create({
      message,
      spinner: 'crescent',
      cssClass: 'custom-loading'
    });
    await loading.present();
    return loading;
  }
}