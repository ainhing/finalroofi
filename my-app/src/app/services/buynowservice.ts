import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BuyNowItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
}

@Injectable({
  providedIn: 'root',
})
export class Buynowservice {
  private buyNowItem$ = new BehaviorSubject<BuyNowItem | null>(null);

  constructor() {}

  setBuyNowItem(item: BuyNowItem): void {
    this.buyNowItem$.next(item);
  }

  getBuyNowItem(): Observable<BuyNowItem | null> {
    return this.buyNowItem$.asObservable();
  }

  getSnapshot(): BuyNowItem | null {
    return this.buyNowItem$.value;
  }

  clear(): void {
    this.buyNowItem$.next(null);
  }
}
