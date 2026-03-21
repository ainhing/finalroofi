import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartItem, Cartservice } from '../../services/cartservice'; // import CartItem nếu cần
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mini-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-cart.html',
  styleUrl: './mini-cart.css',
})
export class MiniCart implements OnInit, OnDestroy {
  items: CartItem[] = [];
  totalQuantity = 0;
  totalPrice = 0;

  private cartSubscription!: Subscription;

  constructor(private cartService: Cartservice) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.getCart().subscribe(items => {
      this.items = items;
      this.totalQuantity = this.cartService.getTotalQuantity();
      this.totalPrice = this.cartService.getTotalPrice();
      // console.log('MiniCart updated - Total qty:', this.totalQuantity); // debug
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  remove(productId: string, size: string) {
    this.cartService.remove(productId, size);
  }
}