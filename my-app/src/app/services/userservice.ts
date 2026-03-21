// src/app/services/userservice.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, shareReplay, catchError } from 'rxjs/operators';
import { AppUser, UserStateService } from './user-stateservice';

@Injectable({ providedIn: 'root' })
export class Userservice {
  private apiUrl = 'http://localhost:3003/users';
  private getUsersCache$: Observable<AppUser[]> | null = null;

  constructor(private http: HttpClient, private state: UserStateService) {}

  private normalize(raw: any): AppUser {
    const UserId = String(raw?.UserId || raw?.id || raw?._id || '');
    return {
      id: UserId,
      UserId,
      email: raw?.email || raw?.Email || '',
      fullname: raw?.fullname || raw?.Fullname || raw?.DisplayName || '',
      role: (raw?.role || raw?.Role || 'customer') as any,
      provider: raw?.provider || raw?.Provider || 'email',
      createdAt: raw?.createdAt || raw?.CreatedAt || '',
      avatarUrl: raw?.avatarUrl || raw?.AvatarUrl || '',
      isActive: raw?.isActive ?? raw?.IsActive ?? true,
    };
  }

  getUsers(forceReload = false): Observable<AppUser[]> {
    if (!forceReload && this.getUsersCache$) return this.getUsersCache$;

    const cached = this.state.getFromCache('all_users');
    if (!forceReload && cached) {
      this.getUsersCache$ = of(cached).pipe(shareReplay(1));
      return this.getUsersCache$;
    }

    this.getUsersCache$ = this.http.get<any>(this.apiUrl).pipe(
      map(res => res?.data || res?.users || res || []),
      map((arr: any[]) => (Array.isArray(arr) ? arr : []).map(x => this.normalize(x))),
      tap(list => this.state.setUsers(list)),
      shareReplay(1),
      catchError(err => {
        console.error('Error fetching users', err);
        return of([] as AppUser[]);
      })
    );
    return this.getUsersCache$;
  }

  getUserById(id: string): Observable<AppUser | undefined> {
    if (!id) return of(undefined);

    const cached = this.state.getFromCache(`user_${id}`);
    if (cached !== null) return of(cached);

    const inState = this.state.getUsersSync().find(u => u.UserId === id || u.id === id);
    if (inState) {
      this.state.setSingleUser(inState);
      return of(inState);
    }

    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res?.user || res?.data || res),
      map(raw => (raw ? this.normalize(raw) : undefined)),
      tap(u => this.state.setSingleUser(u)),
      catchError(err => {
        console.error('Error fetching user by id', err);
        return of(undefined);
      })
    );
  }

  createUser(payload: any) {
    this.getUsersCache$ = null;
    this.state.clearCache('all_users');
    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(res => res?.user || res?.data || res),
      tap(raw => raw && this.state.addUser(this.normalize(raw)))
    );
  }

  updateUser(id: string, payload: any) {
    this.getUsersCache$ = null;
    this.state.clearCache('all_users');
    this.state.clearCache(`user_${id}`);
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => res?.user || res?.data || res),
      tap(raw => this.state.updateUser(this.normalize({ ...raw, UserId: id })))
    );
  }

  deleteUser(id: string) {
    this.getUsersCache$ = null;
    this.state.clearCache('all_users');
    this.state.clearCache(`user_${id}`);
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.state.deleteUser(id))
    );
  }
  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ path: string }>(`${this.apiUrl}/upload-avatar`, formData);
  }
}