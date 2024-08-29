import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  // Método que se llamará al hacer clic en el botón de registro
  register() {
    console.log('Registro iniciado');
    // Aquí puedes agregar la lógica de registro, como validaciones o llamadas a servicios
  }

}
