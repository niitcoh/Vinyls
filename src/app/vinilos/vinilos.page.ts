import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { NavController, ToastController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { DatabaseService } from '../services/database.service';

interface Vinilo {
  id: number;
  titulo: string;
  artista: string;
  imagen: string;
  descripcion: string[];
  tracklist: string[];
  stock: number;
  precio: number;
}

@Component({
  selector: 'app-vinilos',
  templateUrl: './vinilos.page.html',
  styleUrls: ['./vinilos.page.scss'],
})
export class VinilosPage implements OnInit {
  vinilos: Vinilo[] = [];
  vinilosFiltrados: Vinilo[] = [];
  viniloSeleccionado: Vinilo | null = null;
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
      this.databaseService.getAllVinyls().subscribe(vinilosFromDB => {
        this.vinilos = vinilosFromDB.map(vinilo => ({
          ...vinilo,
          descripcion: vinilo.descripcion || [],
          tracklist: Array.isArray(vinilo.tracklist) ? vinilo.tracklist : (vinilo.tracklist ? JSON.parse(vinilo.tracklist) : [])
        }));
        this.vinilosFiltrados = this.vinilos;
      }, error => {
        console.error('Error al cargar vinilos:', error);
        this.presentToast('Error al cargar vinilos. Por favor, intente más tarde.');
      });
    } catch (error) {
      console.error('Error al cargar vinilos:', error);
      await this.presentToast('Error al cargar vinilos. Por favor, intente más tarde.');
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

  mostrarDescripcion(vinilo: Vinilo) {
    this.viniloSeleccionado = vinilo;
    this.mostrarDescripcionDetalle = 'descripcion';
  }

  cerrarDescripcion() {
    this.viniloSeleccionado = null;
  }

  async agregarAlCarrito() {
    if (this.viniloSeleccionado) {
      if (AppComponent.isLoggedIn) {
        try {
          await this.databaseService.updateVinyl({
            ...this.viniloSeleccionado,
            stock: this.viniloSeleccionado.stock - 1
          });
          
          this.cartService.addToCart(this.viniloSeleccionado);
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