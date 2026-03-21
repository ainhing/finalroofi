import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Authservice } from './authservice';

@Injectable({ providedIn: 'root' })
export class Wishlistservice {
  private readonly STORAGE_PREFIX = 'WISHLIST_';
  private wishlistSubject = new BehaviorSubject<string[]>([]);

  // Observable for UI to react instantly when wishlist changes
  wishlistChanges$ = this.wishlistSubject.asObservable();

  constructor(private authService: Authservice) {
    // Initialize from storage on service creation
    this.syncFromStorage();
  }

  private getStorageKey(): string {
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      return `${this.STORAGE_PREFIX}${user.email.toLowerCase()}`;
    }
    return `${this.STORAGE_PREFIX}guest`;
  }

  /** Reload from storage (useful after login/logout) */
  syncFromStorage(): void {
    this.wishlistSubject.next(this.readFromStorage());
  }

  getWishlist(): string[] {
    return this.wishlistSubject.value;
  }

  isInWishlist(productId: string | number): boolean {
    const id = productId.toString();
    return this.wishlistSubject.value.includes(id);
  }

  add(productId: string | number): void {
    const id = productId.toString();
    const list = this.wishlistSubject.value;
    if (!list.includes(id)) {
      const updated = [...list, id];
      this.persist(updated);
    }
  }

  remove(productId: string | number): void {
    const id = productId.toString();
    const updated = this.wishlistSubject.value.filter(pid => pid !== id);
    this.persist(updated);
  }

  toggle(productId: string | number): boolean {
    const id = productId.toString();
    const exists = this.isInWishlist(id);
    if (exists) {
      this.remove(id);
      return false;
    }
    this.add(id);
    return true;
  }

  private readFromStorage(): string[] {
    try {
      const data = localStorage.getItem(this.getStorageKey());
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Wishlist] ❌ Failed to read wishlist', error);
      return [];
    }
  }

  private persist(list: string[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(list));
    this.wishlistSubject.next(list);
  }
}