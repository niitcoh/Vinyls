export interface User {
    id?: number;              // `id` opcional, ya que será autogenerado por la base de datos
    username: string;         // Nombre de usuario único
    password: string;         // Contraseña del usuario
    role: 'customer' | 'admin' | 'manager';  // Roles disponibles para el usuario
    name: string;             // Nombre real del usuario
    email: string;            // Email del usuario
    phoneNumber?: string;     // Número de teléfono opcional
    createdAt?: string;       // Fecha de creación (opcional, se puede generar automáticamente)
    lastLogin?: string;       // Último inicio de sesión (opcional)
  }
  