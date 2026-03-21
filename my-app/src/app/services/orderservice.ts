import { Injectable } from '@angular/core';
import { Authservice } from './authservice';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { AppOrder, OrderStateService, } from './orderstateservice';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class Orderservice {
 private apiUrl = 'http://localhost:3003/orders';
  private getOrdersCache$: Observable<AppOrder[]> | null = null;

  constructor(private http: HttpClient, private state: OrderStateService) {}

  private normalize(raw: any): AppOrder {
    return {
      OrderId:         raw?.OrderId         || '',
      UserId:          raw?.UserId          || '',
      Email:           raw?.Email           || '',
      FullName:        raw?.FullName         || '',
      Phone:           raw?.Phone           || '',
      ShippingAddress: raw?.ShippingAddress || '',
      Items:           Array.isArray(raw?.Items) ? raw.Items : [],
      SubTotal:        Number(raw?.SubTotal    || 0),
      Discount:        Number(raw?.Discount    || 0),
      ShippingFee:     Number(raw?.ShippingFee || 0),
      TotalAmount:     Number(raw?.TotalAmount || 0),
      PaymentMethod:   raw?.PaymentMethod  || 'cod',
      Status:          raw?.Status         || 'pending',
      Note:            raw?.Note           || '',
      CreatedAt:       raw?.CreatedAt      || '',
      UpdatedAt:       raw?.UpdatedAt      || '',
    };
  }

  getOrders(forceReload = false, filters?: { email?: string; status?: string; userId?: string }): Observable<AppOrder[]> {
    // Cache key riêng theo filter (user chỉ thấy đơn của mình, admin thấy tất cả)
    const cacheKey = filters ? 'orders_' + JSON.stringify(filters) : 'all_orders';

    if (!forceReload && this.getOrdersCache$) return this.getOrdersCache$;

    const cached = this.state.getFromCache(cacheKey);
    if (!forceReload && cached) {
      this.getOrdersCache$ = of(cached).pipe(shareReplay(1));
      return this.getOrdersCache$;
    }

    // Build query string từ filters
    const params = new URLSearchParams();
    if (filters?.email)  params.set('email',  filters.email);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.userId) params.set('userId', filters.userId);
    const qs  = params.toString();
    const url = qs ? `${this.apiUrl}?${qs}` : this.apiUrl;

    this.getOrdersCache$ = this.http.get<any>(url).pipe(
      map(res => res?.data || res?.orders || res || []),
      map((arr: any[]) => (Array.isArray(arr) ? arr : []).map(x => this.normalize(x))),
      tap(list => {
        this.state.setCacheScoped(cacheKey, list);
        if (!filters) this.state.setOrders(list);
      }),
      shareReplay(1),
      catchError(err => {
        console.error('Error fetching orders', err);
        return of([] as AppOrder[]);
      })
    );
    return this.getOrdersCache$;
  }

  getOrderById(id: string): Observable<AppOrder | undefined> {
    if (!id) return of(undefined);

    const cached = this.state.getFromCache(`order_${id}`);
    if (cached) return of(cached);

    const inState = this.state.getOrdersSync().find(o => o.OrderId === id);
    if (inState) return of(inState);

    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res?.order || res?.data || res),
      map(raw => raw ? this.normalize(raw) : undefined),
      tap(o => this.state.setSingleOrder(o)),
      catchError(err => {
        console.error('Error fetching order by id', err);
        return of(undefined);
      })
    );
  }

  updateOrder(id: string, payload: Partial<AppOrder>): Observable<any> {
    this.getOrdersCache$ = null;
    this.state.clearCacheByPrefix('orders_');
    this.state.clearCache('all_orders');
    this.state.clearCache(`order_${id}`);
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => res?.order || res?.data || res),
      tap(raw => raw && this.state.updateOrder(this.normalize({ ...raw, OrderId: id })))
    );
  }

  deleteOrder(id: string): Observable<any> {
    this.getOrdersCache$ = null;
    this.state.clearCacheByPrefix('orders_');
    this.state.clearCache('all_orders');
    this.state.clearCache(`order_${id}`);
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.state.deleteOrder(id))
    );
  }

  // Tạo đơn hàng mới từ checkout (cart hoặc buynow)
  createOrder(payload: any): Observable<AppOrder> {
    this.getOrdersCache$ = null;
    this.state.clearCacheByPrefix('orders_');
    this.state.clearCache('all_orders');
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(res => res?.order || res?.data || res),
      map(raw => this.normalize(raw)),
      tap(order => this.state.updateOrder(order))
    );
  }
}