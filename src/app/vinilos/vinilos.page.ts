import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { NavController, ToastController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { DatabaseService } from '../services/database.service';
import { Vinyl } from '../models/vinilos.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-vinilos',
  templateUrl: './vinilos.page.html',
  styleUrls: ['./vinilos.page.scss'],
})
export class VinilosPage implements OnInit {
  vinilos: Vinyl[] = [];
  vinilosFiltrados: Vinyl[] = [];
  viniloSeleccionado: Vinyl | null = null;
  mostrarDescripcionDetalle: 'descripcion' | 'tracklist' = 'descripcion';

  constructor(
    private cartService: CartService,
    private navCtrl: NavController,
    private databaseService: DatabaseService,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarVinilos();
  }

  async cargarVinilos() {
    try {
      const vinilosFromDB = await firstValueFrom(this.databaseService.getVinyls());
      this.vinilos = vinilosFromDB || [];
      this.vinilosFiltrados = this.vinilos;
      if (this.vinilos.length === 0) {
        await this.presentToast('No se encontraron vinilos en la base de datos.', 'warning');
      }
    } catch (error) {
      console.error('Error al cargar vinilos:', error);
      await this.presentToast('Error al cargar vinilos. Por favor, intente más tarde.', 'danger');
    }
  }

  buscarVinilos(event: any) {
    const textoBusqueda = event.target.value.toLowerCase();

    if (textoBusqueda && textoBusqueda.trim() !== '') {
      this.vinilosFiltrados = this.vinilos.filter(vinilo =>
        vinilo.titulo.toLowerCase().includes(textoBusqueda) ||
        vinilo.artista.toLowerCase().includes(textoBusqueda)
      );
    } else {
      this.vinilosFiltrados = this.vinilos;
    }
  }

  mostrarDescripcion(vinilo: Vinyl) {
    this.viniloSeleccionado = vinilo;
    this.mostrarDescripcionDetalle = 'descripcion';
  }

  cerrarDescripcion() {
    this.viniloSeleccionado = null;
  }

  async agregarAlCarrito() {
    if (this.viniloSeleccionado && this.viniloSeleccionado.id !== undefined) {
      if (AppComponent.isLoggedIn) {
        try {
          await firstValueFrom(this.databaseService.updateVinylStock(this.viniloSeleccionado.id, this.viniloSeleccionado.stock - 1));
          
          const viniloParaCarrito: Vinyl & { id: number } = {
            ...this.viniloSeleccionado,
            id: this.viniloSeleccionado.id
          };
          
          this.cartService.addToCart(viniloParaCarrito);
          await this.presentToast(`${this.viniloSeleccionado.titulo} agregado al carrito`);
          
          await this.cargarVinilos();
          
          this.cerrarDescripcion();
        } catch (error) {
          console.error('Error al agregar al carrito:', error);
          await this.presentToast('Error al agregar al carrito. Por favor, intente de nuevo.');
        }
      } else {
        await this.presentToast('Por favor, inicia sesión para agregar al carrito.', 'warning');
      }
    } else {
      await this.presentToast('No se puede agregar este vinilo al carrito.', 'danger');
    }
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }
}