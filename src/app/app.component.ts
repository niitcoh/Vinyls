import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  static isLoggedIn: boolean = false;
  static userRole: string = '';

  constructor() {}

  static login(role: string) {
    AppComponent.isLoggedIn = true;
    AppComponent.userRole = role;
  }

  static logout() {
    AppComponent.isLoggedIn = false;
    AppComponent.userRole = '';
  }
}