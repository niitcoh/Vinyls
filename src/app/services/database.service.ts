import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { Vinyl } from '../models/vinilos.model';  // Usar el modelo Vinyl
import { Order } from '../models/order.model';     // Aquí representan las órdenes de compra
//import { OrderDetail } from '../models/order-detail.model';
import { of, firstValueFrom, forkJoin } from 'rxjs';

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

  async initializeDatabase() {
    try {
      // Crear una nueva base de datos para la tienda de vinilos
      this.database = await this.sqlite.create({
        name: 'vinylstore.db',  // Nombre actualizado de la base de datos
        location: 'default'
      });
  
      await this.createTables();
      await firstValueFrom(this.insertSeedData());
      this.dbReady.next(true);
    } catch (error) {
      console.error('Error initializing database', error);
      this.presentAlert('Error', 'Failed to initialize the database. Please try again.');
    }
  }

  // Definición de tablas
  tableUsers: string = `
    CREATE TABLE IF NOT EXISTS Users (
      UserID INTEGER PRIMARY KEY AUTOINCREMENT,
      Username TEXT NOT NULL UNIQUE,
      Password TEXT NOT NULL,
      Role TEXT NOT NULL CHECK (Role IN ('customer', 'admin', 'manager')),
      Name TEXT NOT NULL,
      Email TEXT UNIQUE,
      PhoneNumber TEXT,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      LastLogin DATETIME
    );`;

  tableVinyls: string = `
    CREATE TABLE IF NOT EXISTS Vinyls (
      VinylID INTEGER PRIMARY KEY AUTOINCREMENT,
      Title TEXT NOT NULL,
      Artist TEXT NOT NULL,
      Price REAL NOT NULL,
      ImageURL TEXT,
      Description TEXT,
      Tracklist TEXT,
      Quantity INTEGER DEFAULT 0,
      IsAvailable BOOLEAN DEFAULT 1,
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );`;

  tableOrders: string = `
    CREATE TABLE IF NOT EXISTS Orders (
      OrderID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserID INTEGER,
      Status TEXT NOT NULL CHECK (Status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled')),
      CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      TotalAmount REAL NOT NULL,
      PaymentMethod TEXT,
      FOREIGN KEY (UserID) REFERENCES Users(UserID)
    );`;

  tableOrderDetails: string = `
    CREATE TABLE IF NOT EXISTS OrderDetails (
      OrderDetailID INTEGER PRIMARY KEY AUTOINCREMENT,
      OrderID INTEGER,
      VinylID INTEGER,
      Quantity INTEGER NOT NULL,
      Price REAL NOT NULL,
      FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
      FOREIGN KEY (VinylID) REFERENCES Vinyls(VinylID)
    );`;

  // BehaviorSubjects para los listados
  private users = new BehaviorSubject<User[]>([]);
  private vinyls = new BehaviorSubject<Vinyl[]>([]); // Renombrado a Vinyls
  private orders = new BehaviorSubject<Order[]>([]);

  // Observable para el estado de la base de datos
  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
  // Alertas
  async presentAlert(titulo: string, msj: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msj,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Observables
  dbState() {
    return this.isDBReady.asObservable();
  }

  fetchUsers(): Observable<User[]> {
    return this.users.asObservable();
  }

  fetchVinyls(): Observable<Vinyl[]> {
    return this.vinyls.asObservable();
  }

  fetchOrders(): Observable<Order[]> {
    return this.orders.asObservable();
  }

  async createTables() {
    try {
      await this.database.executeSql('DROP TABLE IF EXISTS Users', []);
      await this.database.executeSql('DROP TABLE IF EXISTS Vinyls', []);
      await this.database.executeSql('DROP TABLE IF EXISTS Orders', []);
      await this.database.executeSql('DROP TABLE IF EXISTS OrderDetails', []);
  
      await this.database.executeSql(this.tableUsers, []);
      await this.database.executeSql(this.tableVinyls, []);
      await this.database.executeSql(this.tableOrders, []);
      await this.database.executeSql(this.tableOrderDetails, []);
  
      await this.insertSeedData().toPromise();
  
      this.loadInitialData();
      this.isDBReady.next(true);
    } catch (e) {
      this.presentAlert('Creación de Tablas', 'Error al crear las tablas: ' + JSON.stringify(e));
    }
  }

  // Cargar datos iniciales
  loadInitialData() {
    forkJoin([
      this.getAllUsers(),
      this.getAllVinyls(),
      this.getOrdersByStatus(['Pending', 'Processing', 'Shipped'])
    ]).subscribe({
      next: ([users, vinyls, orders]) => {
        this.users.next(users);
        this.vinyls.next(vinyls);
        this.orders.next(orders);
        console.log('Initial data loaded successfully');
      },
      error: error => console.error('Error loading initial data:', error)
    });
  }

  // Métodos CRUD para Users
  getAllUsers(): Observable<User[]> {
    return from(this.database.executeSql('SELECT * FROM Users', [])).pipe(
      map(data => {
        let users: User[] = [];
        for (let i = 0; i < data.rows.length; i++) {
          users.push({
            id: data.rows.item(i).UserID,
            username: data.rows.item(i).Username,
            password: data.rows.item(i).Password,
            role: data.rows.item(i).Role,
            name: data.rows.item(i).Name,
            email: data.rows.item(i).Email,
            phoneNumber: data.rows.item(i).PhoneNumber,
            createdAt: data.rows.item(i).CreatedAt,
            lastLogin: data.rows.item(i).LastLogin
          });
        }
        return users;
      })
    );
  }

  // Métodos CRUD para Vinyls (productos)
  async createVinyl(vinyl: Vinyl): Promise<number> {
    const data = [vinyl.titulo, vinyl.artista, vinyl.precio,  vinyl.imagen, vinyl.descripcion, vinyl.tracklist, vinyl.quantity, vinyl.IsAvailable ? 1 : 0];
    const result = await this.database.executeSql('INSERT INTO Vinyls (Title, Artist, Price, ImageURL,Description,Tracklist, Quantity, IsAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', data);
    this.getAllVinyls();
    return result.insertId;
  }

  getAllVinyls(): Observable<Vinyl[]> {
    return from(this.database.executeSql('SELECT * FROM Vinyls', [])).pipe(
      map(data => {
        let vinyls: Vinyl[] = [];
        for (let i = 0; i < data.rows.length; i++) {
          vinyls.push({
            id: data.rows.item(i).VinylID,
            titulo: data.rows.item(i).Title,
            artista: data.rows.item(i).Artist,
            imagen: data.rows.item(i).imageURL,
            descripcion: data.rows.item(i).descripcion,
            tracklist: data.rows.item(i).tracklist,
            stock: data.rows.item(i).IsAvailable === 1 ? 1 : 0,
            precio: data.rows.item(i).Price,
            quantity: data.rows.item(i).Quantity
          });
        }
        return vinyls;
      })
    );
  }

  // Métodos CRUD para Orders
  async createOrder(order: Order): Promise<number> {
    const data = [order.userId, order.status, order.totalAmount, order.paymentMethod];
    const result = await this.database.executeSql('INSERT INTO Orders (UserID, Status, TotalAmount, PaymentMethod) VALUES (?, ?, ?, ?)', data);
    this.getOrdersByStatus(['Pending', 'Processing', 'Shipped']);
    return result.insertId;
  }

  getOrdersByStatus(statuses: string[]): Observable<Order[]> {
    const placeholders = statuses.map(() => '?').join(',');
    return from(this.database.executeSql(`SELECT * FROM Orders WHERE Status IN (${placeholders})`, statuses)).pipe(
      map(data => {
        let orders: Order[] = [];
        for (let i = 0; i < data.rows.length; i++) {
          orders.push({
            ...data.rows.item(i),
            id: data.rows.item(i).OrderID,
            status: data.rows.item(i).Status,
            totalAmount: data.rows.item(i).TotalAmount
          });
        }
        return orders;
      })
    );
  }

  // Otros métodos permanecen similares, ajustando las referencias de Products a Vinyls
  // ...

  // Datos de prueba para iniciar la base de datos
  insertSeedData(): Observable<boolean> {
    const users = [
      { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User', email: 'admin@vinylstore.com' },
      { username: 'customer1', password: 'cust123', role: 'customer', name: 'Customer One', email: 'cust1@vinylstore.com' }
    ];
  
    const vinyls = [
      { name: 'Abbey Road', artist: 'The Beatles', price: 3500, genre: 'Rock', imageURL: 'abbey_road.jpg', isAvailable: true },
      { name: 'Thriller', artist: 'Michael Jackson', price: 4000, genre: 'Pop', imageURL: 'thriller.jpg', isAvailable: true },
      { name: 'Back to Black', artist: 'Amy Winehouse', price: 3200, genre: 'Soul', imageURL: 'back_to_black.jpg', isAvailable: true }
    ];
    
    // Insertar datos en tablas Users y Vinyls
    // ...

    return of(true); // Retornar Observable de éxito
  }

  async updateVinyl(vinyl: Vinyl): Promise<void> {
    const data = [vinyl.id, vinyl.titulo, vinyl.artista, vinyl.imagen, vinyl.descripcion, vinyl.tracklist, vinyl.stock, vinyl.precio, vinyl.quantity ? 1 : 0, vinyl.id];
    await this.database.executeSql(`UPDATE Vinyls SET Title = ?, Artist = ?, Price = ?, Genre = ?, ImageURL = ?, IsAvailable = ? WHERE VinylID = ?`, data);
    this.getAllVinyls().subscribe(vinyls => {
      this.vinyls.next(vinyls); // Actualizar la lista de vinilos
    });
  }
  
}

