import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, forkJoin, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Vinyl } from '../models/vinilos.model';
import { Order } from '../models/order.model';
import { create } from 'ionicons/icons';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database!: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform, 
    private sqlite: SQLite,
    private alertController: AlertController
  ) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'vinilos.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
        this.database = db;
        this.initializeDatabase();
      })
      .catch(e => console.error('Error creating database', e));
    });
  }

  private async initializeDatabase() {
    try {
      await this.createTables();
      this.dbReady.next(true);
    } catch (error) {
      console.error('Error initializing database', error);
      this.presentAlert('Error', 'Failed to initialize the database. Please try again.');
    }
  }

  isDatabaseReady(): Observable<boolean> {
    return this.dbReady.asObservable();
  }

  private async createTables() {
    const tables = [this.tableUsers, this.tableVinyls, this.tableOrders];
    for (const table of tables) {
      await this.database.executeSql(table, []);
    }
  }

  private tableUsers: string = `
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phoneNumber TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastLogin DATETIME
    );`;

  private tableVinyls: string = `
    CREATE TABLE IF NOT EXISTS Vinyls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      artista TEXT NOT NULL,
      imagen TEXT,
      descripcion TEXT,
      tracklist TEXT,
      stock INTEGER NOT NULL,
      precio REAL NOT NULL,
      IsAvailable BOOLEAN DEFAULT 1
    );`;

  private tableOrders: string = `
    CREATE TABLE IF NOT EXISTS Orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL,
      totalAmount REAL NOT NULL,
      orderDetails TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES Users(id)
    );`;

  async presentAlert(titulo: string, msj: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msj,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private executeSQL(query: string, params: any[] = []): Observable<any> {
    return this.isDatabaseReady().pipe(
      switchMap(ready => {
        if (ready) {
          return from(this.database.executeSql(query, params));
        } else {
          throw new Error('Database not ready');
        }
      }),
      catchError(error => {
        console.error('SQL execution error', error);
        return from([]);
      })
    );
  }

  // User methods
  createUser(user: User): Observable<number> {
    return this.executeSQL(
      'INSERT INTO Users (username, password, role, name, email, phoneNumber) VALUES (?, ?, ?, ?, ?, ?)',
      [user.username, user.password, user.role, user.name, user.email, user.phoneNumber]
    ).pipe(
      map(data => data.insertId)
    );
  }

  getUsers(): Observable<User[]> {
    return this.executeSQL('SELECT * FROM Users').pipe(
      map(data => {
        let users: User[] = [];
        for (let i = 0; i < data.rows.length; i++) {
          users.push(data.rows.item(i));
        }
        return users;
      })
    );
  }

  // Vinyl methods
  createVinyl(vinyl: Vinyl): Observable<number> {
    return this.executeSQL(
      'INSERT INTO Vinyls (titulo, artista, imagen, descripcion, tracklist, stock, precio, IsAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [vinyl.titulo, vinyl.artista, vinyl.imagen, JSON.stringify(vinyl.descripcion), JSON.stringify(vinyl.tracklist), vinyl.stock, vinyl.precio, vinyl.IsAvailable ? 1 : 0]
    ).pipe(
      map(data => data.insertId)
    );
  }

  getVinyls(): Observable<Vinyl[]> {
    return this.executeSQL('SELECT * FROM Vinyls').pipe(
      map(data => {
        let vinyls: Vinyl[] = [];
        for (let i = 0; i < data.rows.length; i++) {
          let item = data.rows.item(i);
          vinyls.push({
            ...item,
            descripcion: JSON.parse(item.descripcion),
            tracklist: JSON.parse(item.tracklist),
            IsAvailable: item.IsAvailable === 1
          });
        }
        return vinyls;
      })
    );
  }

  // Order methods
  createOrder(order: Order): Observable<number> {
    return this.executeSQL(
      'INSERT INTO Orders (userId, status, totalAmount, orderDetails) VALUES (?, ?, ?, ?)',
      [order.userId, order.status, order.totalAmount, JSON.stringify(order.orderDetails)]
    ).pipe(
      map(data => data.insertId)
    );
  }

  getOrders(userId?: number): Observable<Order[]> {
    let query = 'SELECT * FROM Orders';
    let params: any[] = [];
    
    if (userId) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    
    return this.executeSQL(query, params).pipe(
      map(data => {
        let orders: Order[] = [];
        for (let i = 0; i < data.rows.length; i++) {
          let item = data.rows.item(i);
          orders.push({
            ...item,
            orderDetails: JSON.parse(item.orderDetails)
          });
        }
        return orders;
      })
    );
  }

  // Authentication method
  authenticateUser(username: string, password: string): Observable<User | null> {
    return this.executeSQL(
      'SELECT * FROM Users WHERE username = ? AND password = ?',
      [username, password]
    ).pipe(
      map(data => {
        if (data.rows.length > 0) {
          return data.rows.item(0);
        }
        return null;
      })
    );
  }

  // Update vinyl stock
  updateVinylStock(vinylId: number, newStock: number): Observable<boolean> {
    return this.executeSQL(
      'UPDATE Vinyls SET stock = ? WHERE id = ?',
      [newStock, vinylId]
    ).pipe(
      map(() => true),
      catchError(() => from([false]))
    );
  }

  insertSeedData(): Observable<boolean> {
    const users = [
      { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User', email: 'admin@example.com', phoneNumber: '966189340' ,createdAt: '2021-07-01 10:00:00', lastLogin: '2021-07-01 10:00:00' },
      { username: 'employee1', password: 'emp123', role: 'employee', name: 'Employee One', email: 'emp1@example.com', phoneNumber: '91182739,', createdAt: '2021-07-01 10:00:00', lastLogin: '2021-07-01 10:00:00' },
    ];
  
    const products = [
      { titulo: 'Hit me hard & soft', artista: 'Billie Eilish', imagen:'assets/img/hitme.jpg' , descripcion: 
        'El tercer álbum de estudio de Billie Eilish, «HIT ME HARD AND SOFT», lanzado a través de Darkroom/Interscope Records, es su trabajo más atrevido hasta la fecha, una colección diversa pero cohesiva de canciones, idealmente escuchadas en su totalidad, de principio a fin. ' +
        'Exactamente como sugiere el título del álbum; te golpea fuerte y suave tanto lírica como sonoramente, mientras cambia géneros y desafía tendencias a lo largo del camino. ' +
        'Con la ayuda de su hermano y único colaborador, FINNEAS, la pareja escribió, grabó y produjo el álbum juntos en su ciudad natal de Los Ángeles. ' +
        'Este álbum llega inmediatamente después de sus dos álbumes de gran éxito, «WHEN WE ALL FALL ASLEEP WHERE DO WE GO?» y «Happier Than Ever», y trabaja para desarrollar aún más el mundo de Billie Eilish.', 
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
        ], stock: true ,precio: 5.00, IsAvailable: true },
      
    ];
  
    return forkJoin([
      ...users.map(user => 
        from(this.database.executeSql(
          'INSERT OR IGNORE INTO Users (Username, Password, Role, Name, Email, phoneNumber, createdAt, lastLogin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
          [user.username, user.password, user.role, user.name, user.email, user.phoneNumber, user.createdAt, user.lastLogin]
        ))
      ),
      ...products.map(Vinyl => 
        from(this.database.executeSql(
          'INSERT OR IGNORE INTO Products (titulo,artista,imagen,descripcion,tracklist,stock,precio,isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
          [Vinyl.titulo, Vinyl.artista, Vinyl.imagen, Vinyl.descripcion, Vinyl.tracklist, Vinyl.stock, Vinyl.precio, Vinyl.IsAvailable]
        ))
      )
    ]).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error in insertSeedData:', error);
        return of(false);
      })
    );
  }

}

