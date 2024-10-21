export interface User {
  id?: number;
  username: string;
  password: string;
  role: 'user' | 'admin' | 'employee';
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface UserResponse {
  changes?: {
    lastId: number;
  };
  values?: User[];
}