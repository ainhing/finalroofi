import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  date: string;
  imageUrls?: string[];
}

@Injectable({ providedIn: 'root' })
export class Reviewservice {
  private apiUrl = 'http://localhost:3003/reviews';

  constructor(private http: HttpClient) {}

  getReviews(params?: { productId?: string; productName?: string; isApproved?: string | boolean }): Observable<Review[]> {
    const search = new URLSearchParams();
    if (params?.productId) search.set('productId', params.productId);
    if (params?.productName) search.set('productName', params.productName);
    if (params?.isApproved !== undefined) search.set('isApproved', String(params.isApproved));
    const url = search.toString() ? `${this.apiUrl}?${search.toString()}` : this.apiUrl;

    return this.http.get<any>(url).pipe(
      map(res => Array.isArray(res) ? res : res?.data || []),
      catchError(err => {
        console.error('Error loading reviews', err);
        return of([] as Review[]);
      })
    );
  }

  createReview(payload: Partial<Review>) {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateReview(id: string, payload: Partial<Review>) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteReview(id: string) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
