import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppUser {
  id: string;                 // frontend id ( = UserId )
  UserId: string;             // backend id
  email: string;
  password?: string;          // không nên trả về từ API, nhưng dùng cho local demo
  fullname?: string;
  role: 'customer' | 'admin';
  provider?: 'email' | 'google' | 'facebook' | 'instagram';
  createdAt?: string;         // ISO string
  avatarUrl?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private usersSubject = new BehaviorSubject<AppUser[]>([]);
  private singleUserSubject = new BehaviorSubject<AppUser | undefined>(undefined);

  users$ = this.usersSubject.asObservable();
  singleUser$ = this.singleUserSubject.asObservable();

  private cache: Record<string, { data: any; timestamp: number }> = {};
  private cacheExpiry = 5 * 60 * 1000;

  getFromCache(key: string) {
    const entry = this.cache[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp < this.cacheExpiry) return entry.data;
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

  setUsers(users: AppUser[]) {
    this.usersSubject.next(users);
    this.setCache('all_users', users);
  }

  getUsersSync(): AppUser[] {
    return this.usersSubject.value || [];
  }

  setSingleUser(user?: AppUser) {
    this.singleUserSubject.next(user);
    if (user) this.setCache(`user_${user.UserId}`, user);
  }

  updateUser(user: AppUser) {
    this.setSingleUser(user);
    const cur = this.getUsersSync();
    this.setUsers(cur.map(u => (u.UserId === user.UserId ? user : u)));
  }

  addUser(user: AppUser) {
    const cur = this.getUsersSync();
    this.setUsers([user, ...cur]);
    this.setSingleUser(user);
  }

  deleteUser(userId: string) {
    const cur = this.getUsersSync();
    this.setUsers(cur.filter(u => u.UserId !== userId));
    this.cache[`user_${userId}`] = { data: undefined, timestamp: Date.now() };
  }
}