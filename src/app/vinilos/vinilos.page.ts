import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { NavController } from '@ionic/angular';
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
    private databaseService: DatabaseService
  ) {}

  async ngOnInit() {
    await this.cargarVinilos();
  }

  async cargarVinilos() {
    try {
      const vinilosFromDB = await this.databaseService.getVinyls();
      this.vinilos = vinilosFromDB.map(vinilo => ({
        ...vinilo,
        descripcion: vinilo.descripcion ? JSON.parse(vinilo.descripcion) : [],
        tracklist: vinilo.tracklist ? JSON.parse(vinilo.tracklist) : []
      }));
      this.vinilosFiltrados = this.vinilos;
    } catch (error) {
      console.error('Error al cargar vinilos:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
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
          // Actualiza el stock en la base de datos
          await this.databaseService.updateVinyl({
            ...this.viniloSeleccionado,
            stock: this.viniloSeleccionado.stock - 1
          });
          
          this.cartService.addToCart(this.viniloSeleccionado);
          console.log(`Agregado al carrito: ${this.viniloSeleccionado.titulo}`);
          
          // Actualiza la lista de vinilos
          await this.cargarVinilos();
          
          this.cerrarDescripcion();
        } catch (error) {
          console.error('Error al agregar al carrito:', error);
          // Aquí podrías mostrar un mensaje de error al usuario
        }
      } else {
        alert('Por favor, inicia sesión para agregar al carrito.');
      }
    }
  }
}