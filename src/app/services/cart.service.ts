import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Vinyl {
  id: number;
  titulo: string;
  artista: string;
  imagen: string;
  descripcion: string[];
  tracklist: string[];
  stock: number;
  precio: number;
  quantity?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Vinyl[] = [];
  private cartSubject = new BehaviorSubject<Vinyl[]>([]);

  constructor() { }

  getCart() {
    return this.cartSubject.asObservable();
  }

  addToCart(vinyl: Vinyl) {
    const existingVinyl = this.cart.find(item => item.id === vinyl.id);
    if (existingVinyl) {
      existingVinyl.quantity! += 1;
    } else {
      vinyl.quantity = 1;
      this.cart.push(vinyl);
    }
    this.cartSubject.next(this.cart);
  }

  removeFromCart(vinylId: number) {
    this.cart = this.cart.filter(item => item.id !== vinylId);
    this.cartSubject.next(this.cart);
  }

  clearCart() {
    this.cart = [];
    this.cartSubject.next(this.cart);
  }

  getTotal() {
    return this.cart.reduce((total, item) => total + (item.precio * (item.quantity || 1)), 0);
  }

  getCartItemCount() {
    return this.cart.reduce((count, item) => count + (item.quantity || 1), 0);
  }
}
