import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Notificationservice } from './notificationservice';

@Injectable({
  providedIn: 'root'
})
export class Newsletterservice {
  constructor(
    private http: HttpClient,
    private notify: Notificationservice
  ) {}

  subscribe(email: string): Observable<any> {
    // DEMO: Giả lập AJAX call
    // Trong thực tế: return this.http.post('/api/newsletter', { email });
    
    return of({ success: true, message: 'Đăng ký thành công!' }).pipe(
      delay(1000),
      tap(() => {
        console.log('Newsletter subscribed:', email);
      })
    );
  }

  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
