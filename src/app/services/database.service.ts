import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initializePlugin() {
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      // Para el uso en web, necesitamos inicializar el almacén web
      await customElements.whenDefined('jeep-sqlite');
      const jeepSqliteEl = document.querySelector('jeep-sqlite');
      if (jeepSqliteEl != null) {
        await this.sqlite.initWebStore();
      }
    }
  }

  async openDatabase() {
    if (this.sqlite) {
      try {
        this.db = await this.sqlite.createConnection('vinyls_db', false, 'no-encryption', 1, false);
        await this.db.open();
        await this.createTables();
        return true;
      } catch (error) {
        console.error('Error opening database', error);
        return false;
      }
    }
    return false;
  }

  async testConnection(): Promise<boolean> {
    console.log('Iniciando la prueba de conexión'); // <-- Nuevo
    try {
      await this.initializePlugin();
      console.log('Plugin inicializado'); // <-- Nuevo
      const isOpen = await this.openDatabase();
      console.log('Base de datos abierta:', isOpen); // <-- Nuevo
      if (isOpen) {
        const testQuery = 'SELECT 1';
        const result = await this.db.query(testQuery);
        console.log('Resultado de la consulta:', result); // <-- Nuevo
        return !!(result.values && result.values.length > 0);
      }
      return false;
    } catch (error) {
      console.error('Error probando la conexión', error);
      return false;
    }
  }
  async createTables() {
    const queryVinyls = `
      CREATE TABLE IF NOT EXISTS vinyls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        year INTEGER,
        genre TEXT,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 0,
        image TEXT,
        description TEXT,
        tracklist TEXT
      );
    `;

    const queryUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    try {
      await this.db.execute(queryVinyls);
      await this.db.execute(queryUsers);
    } catch (error) {
      console.error('Error creating tables', error);
      throw error;
    }
  }

  // Métodos para vinilos
  async addVinyl(vinyl: any) {
    const query = 'INSERT INTO vinyls (title, artist, year, genre, price, stock, image, description, tracklist) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    try {
      const result = await this.db.run(query, [
        vinyl.title,
        vinyl.artist,
        vinyl.year,
        vinyl.genre,
        vinyl.price,
        vinyl.stock,
        vinyl.image,
        JSON.stringify(vinyl.description),
        JSON.stringify(vinyl.tracklist)
      ]);
      return result;
    } catch (error) {
      console.error('Error adding vinyl', error);
      throw error;
    }
  }

  async getVinyls() {
    const query = 'SELECT * FROM vinyls';
    try {
      const result = await this.db.query(query);
      return result.values || [];
    } catch (error) {
      console.error('Error getting vinyls', error);
      return [];
    }
  }

  async getVinylById(id: number) {
    const query = 'SELECT * FROM vinyls WHERE id = ?';
    try {
      const result = await this.db.query(query, [id]);
      return result.values?.[0];
    } catch (error) {
      console.error('Error getting vinyl by id', error);
      return null;
    }
  }

  async updateVinyl(vinyl: any) {
    const query = 'UPDATE vinyls SET title = ?, artist = ?, year = ?, genre = ?, price = ?, stock = ?, image = ?, description = ?, tracklist = ? WHERE id = ?';
    try {
      const result = await this.db.run(query, [
        vinyl.title,
        vinyl.artist,
        vinyl.year,
        vinyl.genre,
        vinyl.price,
        vinyl.stock,
        vinyl.image,
        JSON.stringify(vinyl.description),
        JSON.stringify(vinyl.tracklist),
        vinyl.id
      ]);
      return result;
    } catch (error) {
      console.error('Error updating vinyl', error);
      throw error;
    }
  }

  async deleteVinyl(id: number) {
    const query = 'DELETE FROM vinyls WHERE id = ?';
    try {
      const result = await this.db.run(query, [id]);
      return result;
    } catch (error) {
      console.error('Error deleting vinyl', error);
      throw error;
    }
  }

  // Métodos para usuarios
  async addUser(user: any) {
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    try {
      const result = await this.db.run(query, [user.username, user.email, user.password]);
      return result;
    } catch (error) {
      console.error('Error adding user', error);
      throw error;
    }
  }

  async getUserByUsername(username: string) {
    const query = 'SELECT * FROM users WHERE username = ?';
    try {
      const result = await this.db.query(query, [username]);
      return result.values?.[0];
    } catch (error) {
      console.error('Error getting user by username', error);
      return null;
    }
  }
}