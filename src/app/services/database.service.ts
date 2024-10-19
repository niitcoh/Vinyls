import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Vinyl } from '../models/vinilos.model';
import { Order } from '../models/order.model';

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
      this.initializeDatabase();
    });
  }

  private async initializeDatabase() {
    try {
      this.database = await this.sqlite.create({
        name: 'vinilos.db',
        location: 'default'
      });

      await this.createTables();
      this.dbReady.next(true);
    } catch (error) {
      console.error('Error initializing database', error);
      this.presentAlert('Error', 'Failed to initialize the database. Please try again.');
    }
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

  // User methods
  createUser(user: User): Observable<number> {
    return from(this.database.executeSql(
      'INSERT INTO Users (username, password, role, name, email, phoneNumber) VALUES (?, ?, ?, ?, ?, ?)',
      [user.username, user.password, user.role, user.name, user.email, user.phoneNumber]
    )).pipe(
      map(data => data.insertId)
    );
  }

  getUsers(): Observable<User[]> {
    return from(this.database.executeSql('SELECT * FROM Users', [])).pipe(
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
    return from(this.database.executeSql(
      'INSERT INTO Vinyls (titulo, artista, imagen, descripcion, tracklist, stock, precio, IsAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [vinyl.titulo, vinyl.artista, vinyl.imagen, JSON.stringify(vinyl.descripcion), JSON.stringify(vinyl.tracklist), vinyl.stock, vinyl.precio, vinyl.IsAvailable ? 1 : 0]
    )).pipe(
      map(data => data.insertId)
    );
  }

  getVinyls(): Observable<Vinyl[]> {
    return from(this.database.executeSql('SELECT * FROM Vinyls', [])).pipe(
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
    return from(this.database.executeSql(
      'INSERT INTO Orders (userId, status, totalAmount, orderDetails) VALUES (?, ?, ?, ?)',
      [order.userId, order.status, order.totalAmount, JSON.stringify(order.orderDetails)]
    )).pipe(
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
    
    return from(this.database.executeSql(query, params)).pipe(
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
    return from(this.database.executeSql(
      'SELECT * FROM Users WHERE username = ? AND password = ?',
      [username, password]
    )).pipe(
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
    return from(this.database.executeSql(
      'UPDATE Vinyls SET stock = ? WHERE id = ?',
      [newStock, vinylId]
    )).pipe(
      map(() => true),
      catchError(() => from([false]))
    );
  }
}