import { Component, OnInit, OnDestroy } from '@angular/core';

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
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  vinilosDestacados: Vinilo[] = [
    {
      id: 5,
      titulo: 'Sempiternal',
      artista: 'Bring me the horizon',
      imagen: 'assets/img/sempiternal.jpg',
      descripcion: [
        'Sempiternal es el cuarto álbum de estudio de la banda de rock británica Bring Me the Horizon. Fue lanzado el 1 de abril de 2013 en todo el mundo a través de RCA Records, un sello subsidiario de Sony Music, y el 2 de abril de 2013 en los Estados Unidos y Canadá a través de Epitaph Records.'
      ],
      tracklist: [
        'Can You Feel My Heart',
        'The House of Wolves',
        'Empire (Let Them Sing)',
        'Sleepwalking',
        'Go to Hell, for Heavens Sake',
        'Shadow Moses',
        'And the Snakes Start to Sing',
        'Seen It All Before',
        'Antivist',
        'Crooked Young',
        'Hospital for Souls'
      ],
      stock: 10,
      precio: 35.990
    },
    {
      id: 6,
      titulo: 'That the spirit',
      artista: 'Bring me the horizon',
      imagen: 'assets/img/spirit.jpg',
      descripcion: [
        'Thats the Spirit —en español: Ese es el espíritu— es el nombre del quinto álbum de estudio de la banda británica Bring Me the Horizon. Fue lanzado el 11 de septiembre de 2015, ​ y marca un sonido bastante alejado al de sus orígenes como una banda de metalcore.'
      ],
      tracklist: [
        'Doomed',
        'Happy Song',
        'Throne',
        'True Friends',
        'Follow You',
        'What You Need',
        'Avalanche',
        'Run',
        'Drown',
        'Blasphemy',
        'Oh No'
      ],
      stock: 10,
      precio: 41.990
    },
    {
      id: 7,
      titulo: 'Anti-icon',
      artista: 'Ghostemane',
      imagen: 'assets/img/anti.jpg',
      descripcion: [],
      tracklist: [
        'Intro.Destitute',
        'Vagabond',
        'Lazaretto',
        'Sacrilege',
        'AI',
        'Fed Up',
        'The Winds of Change',
        'Hydrochloride',
        'Hellrap',
        'Anti-Social Masochistic Rage [ASMR]',
        'Melanchoholic',
        'Calamity',
        'Falling Down'
      ],
      stock: 10,
      precio: 33.900
    },
  ];

  viniloSeleccionado: Vinilo | null = null;
  mostrarDescripcionDetalle: 'descripcion' | 'tracklist' = 'descripcion';

  // Array de URLs para los banners
  banners: string[] = [
    'assets/img/banner.jpg',
    'assets/img/banner2.jpg',
    'assets/img/banner3.png'
  ];

  currentBannerIndex = 0; // Asegúrate de que esto esté definido
  bannerInterval: any;

  ngOnInit() {
    this.startBannerRotation();
  }

  ngOnDestroy() {
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
    }
  }

  startBannerRotation() {
    this.bannerInterval = setInterval(() => {
      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
    }, 4000); // Cambiar de banner cada 4 segundos
  }

  verDetalles(vinilo: Vinilo) {
    this.viniloSeleccionado = vinilo;
  }

  cerrarDescripcion() {
    this.viniloSeleccionado = null;
  }

  agregarAlCarrito() {
    if (this.viniloSeleccionado) {
      console.log(`Agregado al carrito: ${this.viniloSeleccionado.titulo}`);
    }
  }
}
