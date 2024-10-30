import { Injectable } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError, switchMap, tap, first, timeout } from 'rxjs/operators';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { User } from '../models/user.model';
import { Vinyl } from '../models/vinilos.model';
import { Order } from '../models/order.model';

// Interfaces auxiliares
interface TableInfo {
  name: string;
}

interface CountResult {
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database!: SQLiteDBConnection;
  private dbReady = new BehaviorSubject<boolean>(false);
  private sqlite: SQLiteConnection;
  private initializationPromise: Promise<void> | null = null;
  private readonly DB_NAME = 'vinilos.db';

  constructor(
    private platform: Platform,
    private alertController: AlertController
  ) {
    console.log('DatabaseService constructor initialized');
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.initDatabase();
  }

  // Inicialización de la base de datos
  private async initDatabase() {
    if (!this.initializationPromise) {
      console.log('Starting database initialization');
      this.initializationPromise = this.platform.ready()
        .then(() => this.initializeDatabase())
        .catch(error => {
          console.error('Error during database initialization:', error);
          this.dbReady.next(false);
          throw error;
        });
    }
    return this.initializationPromise;
  }

  private async initializeDatabase() {
    const dbName = 'vinilos.db';
    console.log('Initializing database:', dbName);
    
    try {
      if (Capacitor.getPlatform() === 'web') {
        await this.sqlite.initWebStore();
      }
  
      const retCC = await this.sqlite.checkConnectionsConsistency();
      console.log('Connection consistency check:', retCC);
  
      const isConn = (await this.sqlite.isConnection(dbName, false)).result;
      console.log('Existing connection check:', isConn);
  
      let db: SQLiteDBConnection;
      if (retCC.result && isConn) {
        console.log('Retrieving existing connection');
        db = await this.sqlite.retrieveConnection(dbName, false);
      } else {
        console.log('Creating new connection');
        db = await this.sqlite.createConnection(
          dbName,
          false,
          "no-encryption",
          1,
          false
        );
      }
  
      await db.open();
      console.log('Database opened successfully');
      
      this.database = db;
      await this.createTables();
      console.log('Tables created successfully');
      
      await this.insertSeedData().toPromise();
      console.log('Seed data inserted successfully');
  
      this.dbReady.next(true);
      console.log('Database initialization completed successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      this.dbReady.next(false);
      await this.presentAlert('Error', 'Failed to initialize the database. Please try again.');
      throw error;
    }
  }

  // Definición de tablas
  private tableUsers: string = `
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'employee')),
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phoneNumber TEXT,
      photo TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastLogin DATETIME
    )`;

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
      IsAvailable BOOLEAN DEFAULT 1,
      UNIQUE(titulo, artista)
    )`;

  private tableOrders: string = `
    CREATE TABLE IF NOT EXISTS Orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL,
      totalAmount REAL NOT NULL,
      orderDetails TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES Users(id)
    )`;

  private async createTables() {
    console.log('Creating database tables');
    const tables = [this.tableUsers, this.tableVinyls, this.tableOrders];
    for (const table of tables) {
      await this.database.run(table);
    }
  }

  // Métodos de utilidad base de datos
  private executeSQL(query: string, params: any[] = []): Observable<any> {
    console.log('Executing SQL:', query, 'with params:', params);
    
    return from(this.ensureDatabaseReady()).pipe(
      switchMap(ready => {
        if (!ready) {
          throw new Error('Database not ready');
        }
        return from(this.database.query(query, params));
      }),
      tap(result => console.log('SQL execution result:', result)),
      catchError(error => {
        console.error('SQL execution error:', error);
        throw error;
      })
    );
  }

  private async ensureDatabaseReady(): Promise<boolean> {
    console.log('Ensuring database is ready');
    if (!this.dbReady.value) {
      try {
        await this.initDatabase();
        await new Promise<void>((resolve, reject) => {
          const subscription = this.dbReady.pipe(
            first(ready => ready === true),
            timeout(5000)
          ).subscribe({
            next: () => {
              console.log('Database is now ready');
              resolve();
              subscription.unsubscribe();
            },
            error: (error) => {
              console.error('Timeout waiting for database:', error);
              reject(error);
              subscription.unsubscribe();
            }
          });
        });
      } catch (error) {
        console.error('Error ensuring database is ready:', error);
        return false;
      }
    }
    return true;
  }

  isDatabaseReady(): Observable<boolean> {
    return this.dbReady.asObservable();
  }

  async waitForDatabase(): Promise<void> {
    console.log('Waiting for database to be ready');
    if (!this.dbReady.value) {
      await new Promise<void>((resolve, reject) => {
        const subscription = this.dbReady.pipe(
          first(ready => ready === true),
          timeout(5000)
        ).subscribe({
          next: () => {
            resolve();
            subscription.unsubscribe();
          },
          error: (error) => {
            reject(error);
            subscription.unsubscribe();
          }
        });
      });
    }
  }

  async presentAlert(titulo: string, msj: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msj,
      buttons: ['OK'],
    });
    await alert.present();
  }

// MÉTODOS DE USUARIO
createUser(user: User): Observable<number> {
  console.log('Creating user:', user);
  return this.executeSQL(
    `INSERT INTO Users (username, password, role, name, email, phoneNumber, photo, createdAt, lastLogin) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.username,
      user.password,
      user.role,
      user.name,
      user.email,
      user.phoneNumber || '',
      user.photo || '',
      user.createdAt || new Date().toISOString(),
      user.lastLogin || new Date().toISOString()
    ]
  ).pipe(
    map(data => {
      console.log('User created successfully with ID:', data.changes?.lastId);
      return data.changes?.lastId || -1;
    }),
    catchError(error => {
      console.error('Error creating user:', error);
      throw error;
    })
  );
}

getUserByEmail(email: string): Observable<User | null> {
  console.log('Getting user by email:', email);
  if (!email) {
    console.warn('No email provided');
    return of(null);
  }

  return this.executeSQL(
    `SELECT id, username, role, name, email, phoneNumber, photo, createdAt, lastLogin 
     FROM Users 
     WHERE email = ? 
     LIMIT 1`,
    [email]
  ).pipe(
    tap(data => console.log('Raw query result:', data)),
    map(data => {
      if (data.values && data.values.length > 0) {
        const user = data.values[0] as User;
        console.log('User found:', user);
        return {
          ...user,
          photo: user.photo || '',
          phoneNumber: user.phoneNumber || ''
        };
      }
      console.log('No user found for email:', email);
      return null;
    }),
    catchError(error => {
      console.error('Error getting user by email:', error);
      return of(null);
    })
  );
}

getUsers(): Observable<User[]> {
  console.log('Getting all users');
  return this.executeSQL(
    'SELECT id, username, role, name, email, phoneNumber, photo, createdAt, lastLogin FROM Users'
  ).pipe(
    map(data => {
      console.log('Users retrieved:', data.values);
      return (data.values as User[]).map(user => ({
        ...user,
        photo: user.photo || '',
        phoneNumber: user.phoneNumber || ''
      }));
    }),
    catchError(error => {
      console.error('Error getting users:', error);
      return [];
    })
  );
}

updateUser(user: User): Observable<boolean> {
  console.log('Updating user:', user);
  return this.executeSQL(
    `UPDATE Users SET 
     username = ?, 
     name = ?, 
     email = ?, 
     phoneNumber = ?,
     photo = ?
     WHERE id = ?`,
    [user.username, user.name, user.email, user.phoneNumber || '', user.photo || '', user.id]
  ).pipe(
    map(() => {
      console.log('User updated successfully');
      return true;
    }),
    catchError(error => {
      console.error('Error updating user:', error);
      return of(false);
    })
  );
}

updateUserPassword(userId: number, newPassword: string): Observable<boolean> {
  console.log('Updating password for user ID:', userId);
  return this.executeSQL(
    `UPDATE Users SET password = ? WHERE id = ?`,
    [newPassword, userId]
  ).pipe(
    map(() => {
      console.log('Password updated successfully');
      return true;
    }),
    catchError(error => {
      console.error('Error updating password:', error);
      return of(false);
    })
  );
}

deleteUser(email: string): Observable<boolean> {
  console.log('Attempting to delete user:', email);
  return this.executeSQL(
    'DELETE FROM Users WHERE email = ? AND role != ?',
    [email, 'admin']
  ).pipe(
    map(result => {
      const success = result.changes?.changes > 0;
      console.log(success ? 'User deleted successfully' : 'Failed to delete user');
      return success;
    }),
    catchError(error => {
      console.error('Error deleting user:', error);
      return of(false);
    })
  );
}

// MÉTODOS DE VINILO
createVinyl(vinyl: Vinyl): Observable<number> {
  return this.executeSQL(
    `INSERT INTO Vinyls (titulo, artista, imagen, descripcion, tracklist, stock, precio, IsAvailable) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      vinyl.titulo,
      vinyl.artista,
      vinyl.imagen,
      JSON.stringify(vinyl.descripcion),
      JSON.stringify(vinyl.tracklist),
      vinyl.stock,
      vinyl.precio,
      vinyl.IsAvailable ? 1 : 0
    ]
  ).pipe(
    map(data => data.changes?.lastId || -1),
    catchError(error => {
      console.error('Error creating vinyl:', error);
      throw error;
    })
  );
}

getVinyls(): Observable<Vinyl[]> {
  console.log('Getting vinyls from database');
  return this.executeSQL('SELECT * FROM Vinyls').pipe(
    tap(data => console.log('Raw database data:', data)),
    map(data => {
      if (!data.values || data.values.length === 0) {
        console.log('No vinyls found in database');
        return [];
      }
      console.log('Number of vinyls found:', data.values.length);
      return (data.values as any[]).map(item => ({
        ...item,
        descripcion: JSON.parse(item.descripcion),
        tracklist: JSON.parse(item.tracklist),
        IsAvailable: item.IsAvailable === 1
      }));
    }),
    tap(vinyls => console.log('Processed vinyls:', vinyls))
  );
}

updateVinylStock(vinylId: number, newStock: number): Observable<boolean> {
  return this.executeSQL(
    'UPDATE Vinyls SET stock = ? WHERE id = ?',
    [newStock, vinylId]
  ).pipe(
    map(() => true),
    catchError(error => {
      console.error('Error updating vinyl stock:', error);
      return of(false);
    })
  );
}

// MÉTODOS DE ORDEN
createOrder(order: Order): Observable<number> {
  return this.executeSQL(
    'INSERT INTO Orders (userId, status, totalAmount, orderDetails) VALUES (?, ?, ?, ?)',
    [order.userId, order.status, order.totalAmount, JSON.stringify(order.orderDetails)]
  ).pipe(
    map(data => data.changes?.lastId || -1),
    catchError(error => {
      console.error('Error creating order:', error);
      throw error;
    })
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
      return (data.values as any[]).map(item => ({
        ...item,
        orderDetails: JSON.parse(item.orderDetails)
      }));
    }),
    catchError(error => {
      console.error('Error getting orders:', error);
      return [];
    })
  );
}

// AUTENTICACIÓN
authenticateUser(username: string, password: string): Observable<User | null> {
  console.log('Authenticating user:', username);
  const query = `
    SELECT * FROM Users 
    WHERE (username = ? OR email = ?) 
    AND password = ? 
    LIMIT 1
  `;
  return this.executeSQL(query, [username, username, password]).pipe(
    map(data => {
      if (data.values && data.values.length > 0) {
        console.log('User authenticated:', data.values[0]);
        return data.values[0] as User;
      }
      console.log('Authentication failed for:', username);
      return null;
    }),
    catchError(error => {
      console.error('Authentication error:', error);
      return of(null);
    })
  );
}
// MÉTODOS DE VERIFICACIÓN DE ESTADO
async checkDatabaseState(): Promise<{
  isReady: boolean;
  tablesExist: boolean;
  userCount: number;
  vinylCount: number;
}> {
  try {
    const isReady = this.dbReady.value;
    let tablesExist = false;
    let userCount = 0;
    let vinylCount = 0;

    if (isReady) {
      // Verificar existencia de tablas
      const hasUsers = await this.tableExists('Users');
      const hasVinyls = await this.tableExists('Vinyls');
      tablesExist = hasUsers && hasVinyls;

      if (tablesExist) {
        userCount = await this.getTableCount('Users');
        vinylCount = await this.getTableCount('Vinyls');
      }
    }

    const state = { 
      isReady, 
      tablesExist, 
      userCount, 
      vinylCount 
    };
    
    console.log('Database state:', state);
    return state;
  } catch (error) {
    console.error('Error checking database state:', error);
    return { 
      isReady: false, 
      tablesExist: false, 
      userCount: 0, 
      vinylCount: 0 
    };
  }
}

async checkDatabaseHealth(): Promise<{
  status: 'ok' | 'error';
  details: {
    connection: boolean;
    tables: {
      users: boolean;
      vinyls: boolean;
      orders: boolean;
    };
    counts: {
      users: number;
      vinyls: number;
      orders: number;
    };
  };
  errors: string[];
}> {
  const errors: string[] = [];
  let connection = false;
  const tables = {
    users: false,
    vinyls: false,
    orders: false
  };
  const counts = {
    users: 0,
    vinyls: 0,
    orders: 0
  };

  try {
    // Verificar conexión
    connection = this.dbReady.value;
    if (!connection) {
      errors.push('Database connection not ready');
    }

    if (connection) {
      // Verificar tablas
      tables.users = await this.tableExists('Users');
      tables.vinyls = await this.tableExists('Vinyls');
      tables.orders = await this.tableExists('Orders');

      if (!tables.users) errors.push('Users table missing');
      if (!tables.vinyls) errors.push('Vinyls table missing');
      if (!tables.orders) errors.push('Orders table missing');

      // Obtener conteos si las tablas existen
      if (tables.users) counts.users = await this.getTableCount('Users');
      if (tables.vinyls) counts.vinyls = await this.getTableCount('Vinyls');
      if (tables.orders) counts.orders = await this.getTableCount('Orders');
    }

    return {
      status: errors.length === 0 ? 'ok' : 'error',
      details: {
        connection,
        tables,
        counts
      },
      errors
    };
  } catch (error) {
    console.error('Error in database health check:', error);
    errors.push('Unexpected error during health check');
    return {
      status: 'error',
      details: {
        connection: false,
        tables: {
          users: false,
          vinyls: false,
          orders: false
        },
        counts: {
          users: 0,
          vinyls: 0,
          orders: 0
        }
      },
      errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// MÉTODOS AUXILIARES
private async tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await this.database.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName]
    );
    return Boolean(result.values && result.values.length > 0);
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

private async getTableCount(tableName: string): Promise<number> {
  try {
    const result = await this.database.query(`SELECT COUNT(*) as count FROM ${tableName}`);
    if (result.values && result.values.length > 0) {
      return (result.values[0] as CountResult).count;
    }
    return 0;
  } catch (error) {
    console.error(`Error getting count for table ${tableName}:`, error);
    return 0;
  }
}

// INSERCIÓN DE DATOS DE PRUEBA
insertSeedData(): Observable<boolean> {
  console.log('Starting seed data insertion');
  
  return this.executeSQL('SELECT COUNT(*) as count FROM Users').pipe(
    switchMap(result => {
      const count = result.values[0].count;
      console.log('Current user count:', count);
      
      if (count > 0) {
        console.log('Data already exists. Skipping seed data insertion.');
        return of(true);
      }

      const users = [
        { 
          username: 'admin', 
          password: 'admin123', 
          role: 'admin' as const, 
          name: 'Admin User', 
          email: 'admin@example.com', 
          phoneNumber: '966189340', 
          photo: '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        { 
          username: 'employee1', 
          password: 'emp123', 
          role: 'employee' as const, 
          name: 'Employee One', 
          email: 'emp1@example.com', 
          phoneNumber: '91182739',
          photo: '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      ];

      const products: Vinyl[] = [
        { 
          titulo: 'Hit me hard & soft', 
          artista: 'Billie Eilish', 
          imagen: 'assets/img/hitme.jpg', 
          descripcion: [
            'El tercer álbum de estudio de Billie Eilish, «HIT ME HARD AND SOFT», lanzado a través de Darkroom/Interscope Records.',
            'Exactamente como sugiere el título del álbum; te golpea fuerte y suave tanto lírica como sonoramente.',
            'Con la ayuda de su hermano y único colaborador, FINNEAS, la pareja escribió, grabó y produjo el álbum juntos.',
            'Este álbum llega después de sus dos álbumes de gran éxito anteriores.'
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
          precio: 5.00,
          IsAvailable: true 
        }
      ];

      console.log('Inserting seed data...');

      // Insertar usuarios
      const userPromises = users.map(user => 
        this.database.run(
          `INSERT OR REPLACE INTO Users 
           (username, password, role, name, email, phoneNumber, photo, createdAt, lastLogin) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.username,
            user.password,
            user.role,
            user.name,
            user.email,
            user.phoneNumber,
            user.photo,
            user.createdAt,
            user.lastLogin
          ]
        ).then(() => console.log(`User inserted: ${user.username}`))
      );

      // Insertar vinilos
      const vinylPromises = products.map(vinyl => 
        this.database.run(
          `INSERT OR REPLACE INTO Vinyls 
           (titulo, artista, imagen, descripcion, tracklist, stock, precio, IsAvailable) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            vinyl.titulo,
            vinyl.artista,
            vinyl.imagen,
            JSON.stringify(vinyl.descripcion),
            JSON.stringify(vinyl.tracklist),
            vinyl.stock,
            vinyl.precio,
            vinyl.IsAvailable ? 1 : 0
          ]
        ).then(() => console.log(`Vinyl inserted: ${vinyl.titulo}`))
      );

      // Ejecutar todas las inserciones
      return from(Promise.all([...userPromises, ...vinylPromises])).pipe(
        map(() => {
          console.log('Seed data inserted successfully');
          return true;
        }),
        catchError(error => {
          console.error('Error inserting seed data:', error);
          return of(false);
        })
      );
    })
  );
}
}