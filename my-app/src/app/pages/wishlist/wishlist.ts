import { Component, OnInit, ChangeDetectorRef, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Wishlistservice } from '../../services/wishlistservice';
import { Product, Productservice } from '../../services/productservice';
import { Cartservice } from '../../services/cartservice';
import { Authservice } from '../../services/authservice';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  standalone: false,
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.css']
})
export class Wishlist implements OnInit, OnDestroy {
  products: Product[] = [];
  isLoading = false;
  private wishlistSub?: Subscription;

  // Toast notifications
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  timeoutId: any;

  constructor(
    private wishlistService: Wishlistservice,
    private productService: Productservice,
    private cartService: Cartservice,
    private authService: Authservice,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.wishlistService.syncFromStorage();
    this.wishlistSub = this.wishlistService.wishlistChanges$.subscribe(() => this.loadWishlist());
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    const ids = this.wishlistService.getWishlist();
    this.productService.getProductsByIds(ids).subscribe(list => {
      // Preserve order by ids
      this.products = ids
        .map(id => list.find(p => p.id === id))
        .filter((p): p is Product => !!p);
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  toggleWishlist(event: Event, product: Product): void {
    event.stopPropagation();
    this.wishlistService.remove(product.id);
    this.products = this.products.filter(p => p.id !== product.id);
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: 'M'
    });
    this.showToast(`Đã thêm nhanh: "${product.name}"`, 'success');
  }

  viewDetail(product: Product): void {
    this.router.navigate(['/product-detail', product.id]);
  }

  clearAll(): void {
    this.products = [];
    this.wishlistService.getWishlist().forEach(id => this.wishlistService.remove(id));
  }

  // Hiển thị thông báo toast
  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    this.cdr.detectChanges();

    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.showNotification = false;
          this.cdr.detectChanges();
        });
      }, 3000);
    });
  }

  closeToast(): void {
    this.showNotification = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.wishlistSub?.unsubscribe();
  }
}
