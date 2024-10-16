import { Component } from '@angular/core';
import { NavController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  static isLoggedIn: boolean = false;
  static userRole: string = '';
  static userName: string = '';

  // Getter methods for easier access in templates
  get isLoggedIn(): boolean {
    return AppComponent.isLoggedIn;
  }

  get isAdmin(): boolean {
    return AppComponent.userRole === 'admin';
  }

  get userName(): string {
    return AppComponent.userName;
  }

  constructor(
    private navCtrl: NavController,
    private menuCtrl: MenuController
  ) {}

  static login(role: string, name: string) {
    AppComponent.isLoggedIn = true;
    AppComponent.userRole = role;
    AppComponent.userName = name;
  }

  logout() {
    AppComponent.isLoggedIn = false;
    AppComponent.userRole = '';
    AppComponent.userName = '';
    this.navCtrl.navigateRoot('/home');
    this.menuCtrl.close();
  }

  closeMenu() {
    this.menuCtrl.close();
  }
}