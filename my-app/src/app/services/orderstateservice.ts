import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';

export interface OrderItem {
  ProductId:   string;
  ProductName: string;
  Size:        string;
  Price:       number;
  Quantity:    number;
  Image?:      string;
}

export interface AppOrder {
  OrderId:         string;
  UserId:          string;
  Email:           string;
  FullName:        string;
  Phone:           string;
  ShippingAddress: string;
  Items:           OrderItem[];
  SubTotal:        number;
  Discount:        number;
  ShippingFee:     number;
  TotalAmount:     number;
  PaymentMethod:   string;
  Status:          OrderStatus;
  Note:            string;
  CreatedAt:       string;
  UpdatedAt:       string;
}

@Injectable({ providedIn: 'root' })
export class OrderStateService {
 private ordersSubject      = new BehaviorSubject<AppOrder[]>([]);
  private singleOrderSubject = new BehaviorSubject<AppOrder | undefined>(undefined);

  orders$      = this.ordersSubject.asObservable();
  singleOrder$ = this.singleOrderSubject.asObservable();

  private cache: Record<string, { data: any; timestamp: number }> = {};
  private readonly TTL = 5 * 60 * 1000; // 5 phút

  // ── Cache helpers ──────────────────────────────────────────────────────
  getFromCache(key: string): any {
    const entry = this.cache[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp < this.TTL) return entry.data;
    delete this.cache[key];
    return null;
  }

  setCache(key: string, data: any) {
    this.cache[key] = { data, timestamp: Date.now() };
  }

  clearCache(key?: string) {
    if (key) delete this.cache[key];
    else this.cache = {};
  }

  /** Xóa tất cả cache có key bắt đầu bằng prefix (ví dụ: 'orders_') */
  clearCacheByPrefix(prefix: string) {
    Object.keys(this.cache)
      .filter(k => k.startsWith(prefix))
      .forEach(k => delete this.cache[k]);
  }

  /** Lưu cache theo key tùy chỉnh (không ghi vào ordersSubject) */
  setCacheScoped(key: string, data: any) {
    this.cache[key] = { data, timestamp: Date.now() };
  }

  // ── Orders list ────────────────────────────────────────────────────────
  setOrders(orders: AppOrder[]) {
    this.ordersSubject.next(orders);
    this.setCache('all_orders', orders);
  }

  getOrdersSync(): AppOrder[] {
    return this.ordersSubject.value || [];
  }

  // ── Single order ───────────────────────────────────────────────────────
  setSingleOrder(order?: AppOrder) {
    this.singleOrderSubject.next(order);
    if (order) this.setCache(`order_${order.OrderId}`, order);
  }

  updateOrder(order: AppOrder) {
    this.setSingleOrder(order);
    const cur = this.getOrdersSync();
    this.setOrders(cur.map(o => (o.OrderId === order.OrderId ? order : o)));
  }

  deleteOrder(orderId: string) {
    const cur = this.getOrdersSync();
    this.setOrders(cur.filter(o => o.OrderId !== orderId));
    this.clearCache(`order_${orderId}`);
  }
}