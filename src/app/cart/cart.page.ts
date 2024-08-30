import { Component, OnInit } from '@angular/core';
import { CartService, Vinyl } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  cart: Vinyl[] = [];
  total = 0;

  constructor(private cartService: CartService) { }

  ngOnInit() {
    this.cartService.getCart().subscribe((cart) => {
      this.cart = cart;
      this.total = this.cartService.getTotal();
    });
  }

  removeItem(vinylId: number) {
    this.cartService.removeFromCart(vinylId);
  }

  clearCart() {
    this.cartService.clearCart();
  }
}
