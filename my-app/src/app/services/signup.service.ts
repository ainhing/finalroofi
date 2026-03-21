import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignupService {
  constructor(private http: HttpClient) {}

  register(payload: any): Observable<any> {
    // TODO: replace with real API endpoint
    return this.http.post('/api/signup', payload);
  }
}
