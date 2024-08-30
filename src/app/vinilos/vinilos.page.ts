import { Component, OnInit } from '@angular/core';

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
export class VinilosPage implements OnInit {  //Añadir los vinilos
  vinilos: Vinilo[] = [
    {
      id: 1,
      titulo: 'Hit me hard & soft',
      artista: 'Billie Eilish',
      imagen: 'assets/img/hitme.jpg',
      descripcion: [
        'El tercer álbum de estudio de Billie Eilish, «HIT ME HARD AND SOFT», lanzado a través de Darkroom/Interscope Records, es su trabajo más atrevido hasta la fecha, una colección diversa pero cohesiva de canciones, idealmente escuchadas en su totalidad, de principio a fin.',
        'Exactamente como sugiere el título del álbum; te golpea fuerte y suave tanto lírica como sonoramente, mientras cambia géneros y desafía tendencias a lo largo del camino.',
        'Con la ayuda de su hermano y único colaborador, FINNEAS, la pareja escribió, grabó y produjo el álbum juntos en su ciudad natal de Los Ángeles.',
        'Este álbum llega inmediatamente después de sus dos álbumes de gran éxito, «WHEN WE ALL FALL ASLEEP WHERE DO WE GO?» y «Happier Than Ever», y trabaja para desarrollar aún más el mundo de Billie Eilish.'
      ],
      tracklist: [
        'Skinny',
        'Lunch',
        'Chihiro',
        'Birds Of A Feather',
        'Wildflower',
        'The Greatest',
        'LAmour De Ma Vie',
        'The Diner',
        'Bittersuite',
        'Blue'
      ],
      stock: 10,
      precio: 39.990
    },
    {
      id: 2,
      titulo: 'Dont smite at me',
      artista: 'Billie Eilish',
      imagen: 'assets/img/dontat.jpg',
      descripcion: [
        'Dont Smile at Me, es el primer extended play de la cantante estadounidense Billie Eilish​ Se lanzó el 11 de agosto de 2017 a través del sello discográfico Interscope Records, ​ y contiene varios de sus sencillos lanzados previamente, incluidos «Ocean Eyes», «Bellyache» y «Watch».'
      ],
      tracklist: [
        'COPYCAT',
        '​idontwannabeyouanymore',
        'my boy',
        'watch',
        'party favor',
        'bellyache',
        'ocean eyes',
        'hostage',
        '​&burn by Billie Eilish & Vince Staples',
      ],
      stock: 10,
      precio: 29.990
    },
    {
      id: 3,
      titulo: 'Happier than ever',
      artista: 'Billie Eilish',
      imagen: 'assets/img/happier.jpg',
      descripcion: [
       'Happier Than Ever es el segundo álbum de estudio de la cantautora estadounidense Billie Eilish, cuyo lanzamiento tuvo lugar el 30 de julio de 2021. Sirve como continuación de When We All Fall Asleep, Where Do We Go?. Eilish coescribió el álbum con su productor y hermano Finneas OConnell.'
      ],
      tracklist: [
        'Getting Older',
        'I Didnt Change My Number',
        'Billie Bossa Nova',
        '​my future',
        'Oxytocin',
        'GOLDWING',
        'Lost Cause',
        'Halleys Comet',
        'Not My Responsibility',
        'OverHeated',
        'Everybody Dies',
        'Your Power',
        'NDA',
        'Therefore I Am',
        'Happier Than Ever',
        'Male Fantasy'
      ],
      stock: 10,
      precio: 25.990
    },
    {
      id: 4,
      titulo: 'When We All Fall Asleep, Where Do We Go?',
      artista: 'Billie Eilish',
      imagen: 'assets/img/whenwe.jpg',
      descripcion: [
       'When We All Fall Asleep, Where Do We Go? es el álbum de estudio debut de la cantante y compositora estadounidense Billie Eilish. Fue lanzado el 29 de marzo de 2019 por Darkroom e Interscope Records en los Estados Unidos y Polydor Records en el Reino Unido. '
      ],
      tracklist: [
        '!!!!!!!',
        '​bad guy',
        'xanny',
        '​you should see me in a crown',
        '​all the good girls go to hell',
        '​wish you were gay',
        '​when the partys over',
        '8',
        '​my strange addiction',
        '​bury a friend',
        '​ilomilo',
        '​listen before i go',
        '​i love you',
        '​goodbye'
      ],
      stock: 10,
      precio: 21.990
    },
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
      descripcion: [
        
      ],
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
    {
      id: 8,
      titulo: 'The Death of Peace of Mind',
      artista: 'Bad Omens',
      imagen: 'assets/img/thedeath.jpg',
      descripcion: [
        
      ],
      tracklist: [
        'Concrete Jungle',
        'Nowhere To Go',
        'Take Me First',
        'The Death Of Peace Of Mind',
        'What It Cost',
        'Like A Villain',
        'Bad Decisions',
        'Just Pretend',
        'The Grey',
        'Who Are You',
        'Somebody Else',
        'IDWT$',
        'What Do You Want From Me?',
        'Artificial Suicide',
        'Miracle'
      ],
      stock: 10,
      precio: 33.900
    },
    {
      id: 9,
      titulo: 'Scoring the End of the World',
      artista: 'Motionless in White',
      imagen: 'assets/img/scoring.jpg',
      descripcion: [
        'Scoring the End of the World —en español: Anotando el fin del mundo— es el sexto álbum de estudio de la banda estadounidense de metalcore Motionless in White. Fue lanzado el 10 de junio de 2022 a través de Roadrunner Records. El álbum fue producido por Drew Fulk y Justin DeBlieck.'
      ],
      tracklist: [
        'Meltdown',
        'Sign of Life',
        'Werewolf',
        'Porcelain',
        'Slaughterhouse',
        'Masterpiece',
        'Cause of Death',
        'We Become the Night',
        'Burned at Both Ends II',
        'B.F.B.T.G.: Corpse Nation',
        'Cyberhex',
        'Red, White & Boom',
        'Scoring the End of the World'
      ],
      stock: 10,
      precio: 31.990
    },
    {
      id: 10,
      titulo: 'For those that wish to exist',
      artista: 'Architects',
      imagen: 'assets/img/for.jpg',
      descripcion: [
        'For Those That Wish to Exist es el noveno álbum de estudio de la banda británica de metalcore Architects. Se lanzó el 26 de febrero de 2021 a través de Epitaph Records. El álbum fue producido por Dan Searle y Josh Middleton.​​'
      ],
      tracklist: [
        'Do You Dream of Armageddon',
        'Black Lungs',
        'Giving Blood',
        'Discourse Is Dead',
        'Dead Butterflies',
        'An Ordinary Extinction',
        'Impermanence',
        'Flight Without Feathers',
        'Little Wonder',
        'Animals',
        'Libertine',
        'Goliath',
        'Demi God',
        'Meteor',
        'Dying Is Absolutely Safe'
      ],
      stock: 10,
      precio: 34.990
    },
    {
      id: 11,
      titulo: 'Disguise',
      artista: 'Motionless in White',
      imagen: 'assets/img/disguise.jpg',
      descripcion: [
        'Disguise —en español: Disfraz— es el quinto álbum de estudio de la banda estadounidense de metal gótico, Motionless in White, fue lanzado el 7 de junio a través de Roadrunner Records, es el segundo álbum que es lanzado a través de esta compañía tras su salida de Fearless Records.​ ​'
      ],
      tracklist: [
        'Disguise',
        'Headache',
        '</c0de>',
        'Thoughts & Prayers',
        'Legacy',
        'Undead Ahead 2: The Tale of the Midnight Ride',
        'Holding on to Smoke',
        'Another Life',
        'Broadcasting from Beyond the Grave: Death Inc.',
        'Brand New Numb',
        'Catharsis'
      ],
      stock: 10,
      precio: 28.990
    },
  ];

  vinilosFiltrados: Vinilo[] = [];

  viniloSeleccionado: Vinilo | null = null;

  mostrarDescripcionDetalle: 'descripcion' | 'tracklist' = 'descripcion';

  constructor() { }

  ngOnInit() { this.vinilosFiltrados = this.vinilos; }

  buscarVinilos(event: any) {
    const textoBusqueda = event.target.value.toLowerCase(); //Busca solamente por el nombre del album o artista

    if (textoBusqueda && textoBusqueda.trim() !== '') {
      this.vinilosFiltrados = this.vinilos.filter(vinilo => 
        vinilo.titulo.toLowerCase().includes(textoBusqueda) ||
        vinilo.artista.toLowerCase().includes(textoBusqueda)
      );
    } else {
      this.vinilosFiltrados = this.vinilos; // si la busqueda esta vacia , muestra todos los vinilos
    }
  }

  mostrarDescripcion(vinilo: Vinilo) {
    this.viniloSeleccionado = vinilo;
    this.mostrarDescripcionDetalle = 'descripcion';  // Separa la tracklist y la descripcion en la card
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
