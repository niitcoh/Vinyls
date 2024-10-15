import { TestBed } from '@angular/core/testing';
import { DatabaseService } from './database.service';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let sqliteConnectionMock: jasmine.SpyObj<SQLiteConnection>;
  let dbConnectionMock: jasmine.SpyObj<SQLiteDBConnection>;

  beforeEach(() => {
    const sqliteConnectionSpy = jasmine.createSpyObj('SQLiteConnection', ['createConnection']);
    const dbConnectionSpy = jasmine.createSpyObj('SQLiteDBConnection', ['open', 'query', 'run']);
  
    TestBed.configureTestingModule({
      providers: [
        DatabaseService,
        { provide: CapacitorSQLite, useValue: {} },
        { provide: SQLiteConnection, useValue: sqliteConnectionSpy }
      ]
    });
  
    service = TestBed.inject(DatabaseService);
    sqliteConnectionMock = TestBed.inject(SQLiteConnection) as jasmine.SpyObj<SQLiteConnection>;
    dbConnectionMock = dbConnectionSpy;
  
    sqliteConnectionMock.createConnection.and.returnValue(Promise.resolve(dbConnectionMock));
  
    // Accede a la propiedad privada sqlite y asígnale el mock
    (service as any).sqlite = sqliteConnectionMock;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should test connection successfully', async () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('ios');
    dbConnectionMock.open.and.returnValue(Promise.resolve());
    dbConnectionMock.query.and.returnValue(Promise.resolve({ values: [{ '1': 1 }] }));

    const result = await service.testConnection();

    expect(result).toBe(true);
    expect(sqliteConnectionMock.createConnection).toHaveBeenCalled();
    expect(dbConnectionMock.open).toHaveBeenCalled();
    expect(dbConnectionMock.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('should handle connection failure', async () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('ios');
    dbConnectionMock.open.and.throwError(new Error('Connection failed'));

    const result = await service.testConnection();

    expect(result).toBe(false);
    expect(sqliteConnectionMock.createConnection).toHaveBeenCalled();
    expect(dbConnectionMock.open).toHaveBeenCalled();
    expect(dbConnectionMock.query).not.toHaveBeenCalled();
  });

  it('should handle query failure', async () => {
    spyOn(Capacitor, 'getPlatform').and.returnValue('ios');
    dbConnectionMock.open.and.returnValue(Promise.resolve());
    dbConnectionMock.query.and.callFake(() => {
      throw new Error('Query failed');
    });

    const result = await service.testConnection();

    expect(result).toBe(false);
    expect(sqliteConnectionMock.createConnection).toHaveBeenCalled();
    expect(dbConnectionMock.open).toHaveBeenCalled();
    expect(dbConnectionMock.query).toHaveBeenCalledWith('SELECT 1');
  });
});