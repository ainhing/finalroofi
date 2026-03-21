import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Authservice } from './authservice';

/**
 * =========================
 * CART ITEM MODEL
 * =========================
 * Chuẩn để dùng:
 * - UI hiện tại
 * - Backend MongoDB sau này
 */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  oldPrice?: number;
  quantity: number;
  image: string;
  size: string;
}

/**
 * =========================
 * CART SERVICE
 * =========================
 * Mỗi user có giỏ hàng riêng
 */
@Injectable({
  providedIn: 'root'
})
export class Cartservice {

  /** Prefix key lưu localStorage */
  private readonly STORAGE_PREFIX = 'APP_CART_';
  private readonly GUEST_CART_KEY = 'APP_CART_GUEST'; // Giỏ hàng guest (chưa login)

  /** State giỏ hàng */
  private cart$ = new BehaviorSubject<CartItem[]>([]);
  cartCount$ = this.cart$.pipe(
    map(items => items.reduce((sum, item) => sum + item.quantity, 0))
  );

  private currentUserEmail: string | null = null;

  constructor(private authService: Authservice) {
    // Load dữ liệu giỏ hàng của user hiện tại
    this.initializeCart();

    // Tự động lưu mỗi khi cart thay đổi
    this.cart$.subscribe(cart => {
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(cart));
    });
  }

  // =========================
  // INITIALIZE & SWITCHING USERS
  // =========================

  /**
   * Khởi tạo giỏ hàng - gọi lúc app start và khi login/logout
   */
  private initializeCart(): void {
    const user = this.authService.getCurrentUser();
    const newEmail = user?.email || null;

    // Nếu user thay đổi, load giỏ hàng của user đó
    if (newEmail !== this.currentUserEmail) {
      this.currentUserEmail = newEmail;
      this.loadFromStorage();
    }
  }

  /**
   * Gọi lúc login - load giỏ hàng của user mới
   */
  public onUserLogin(email: string): void {
    this.currentUserEmail = email;
    this.loadFromStorage();
  }

  /**
   * Gọi lúc logout - clear giỏ hàng
   */
  public onUserLogout(): void {
    this.currentUserEmail = null;
    this.cart$.next([]);
  }

  // =========================
  // HELPER METHODS
  // =========================

  /**
   * Lấy key lưu giỏ hàng dựa vào user hiện tại
   */
  private getStorageKey(): string {
    if (this.currentUserEmail) {
      return `${this.STORAGE_PREFIX}${this.currentUserEmail}`;
    }
    return this.GUEST_CART_KEY;
  }

  // =========================
  // PUBLIC API
  // =========================

  /** Observable cho component subscribe */
  getCart(): Observable<CartItem[]> {
    return this.cart$.asObservable();
  }

  /** Lấy snapshot (dùng khi không cần subscribe) */
  getSnapshot(): CartItem[] {
    return this.cart$.value;
  }

  /** Thêm sản phẩm vào giỏ */
  add(item: CartItem): void {
    if (!item.productId) return;

    const cart = [...this.cart$.value];
    // QUAN TRỌNG: Phải kiểm tra cả Size
    const found = cart.find(i => i.productId === item.productId && i.size === item.size);

    if (found) {
      found.quantity += item.quantity;
    } else {
      cart.push({ ...item });
    }

    this.cart$.next(cart);
  }

  /** Giảm số lượng (dùng cho cart page) */
  decrease(productId: string, size: string): void {
    const cart = [...this.cart$.value];
    const found = cart.find(i => i.productId === productId && i.size === size);

    if (!found) return;

    found.quantity--;

    if (found.quantity <= 0) {
      // SỬA: Truyền thêm 'size' vào hàm remove
      this.remove(productId, size); 
      return;
    }

    this.cart$.next(cart);
  }
  
  /** Xoá 1 sản phẩm */
  remove(productId: string, size: string): void {
    const currentCart = this.cart$.value;
    const newCart = currentCart.filter(i => !(i.productId === productId && i.size === size));
    this.cart$.next(newCart);
  }

  /** Xoá toàn bộ giỏ */
  clear(): void {
    this.cart$.next([]);
  }

  // =========================
  // COMPUTED VALUES
  // =========================

  /** Tổng số lượng (header cart icon) */
  getTotalQuantity(): number {
    return this.cart$.value.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  /** Tổng tiền (cart page / checkout) */
  getTotalPrice(): number {
    return this.cart$.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
  

  // =========================
  // LOCAL STORAGE
  // =========================

  private loadFromStorage(): void {
    const key = this.getStorageKey();
    const raw = localStorage.getItem(key);
    
    if (!raw) {
      this.cart$.next([]);
      return;
    }

    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        this.cart$.next(data);
      } else {
        this.cart$.next([]);
      }
    } catch {
      this.cart$.next([]);
    }
  }

  // =========================
  // BACKEND / MONGODB
  // =========================

  /**
   * Payload gửi API
   * POST /orders
   */
  toMongoPayload() {
    return {
      userEmail: this.currentUserEmail,
      items: this.cart$.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      totalPrice: this.getTotalPrice(),
      createdAt: new Date()
    };
  }
}
