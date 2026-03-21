import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cartservice } from './cartservice';

export interface User {
  email: string;
  password: string;
  fullname?: string;
  role: 'customer' | 'admin';
  provider?: 'email' | 'google' | 'facebook' | 'instagram';
  createdAt?: Date;
  avatarUrl?: string;
  // FIX: thêm isActive để admin có thể khóa tài khoản
  isActive?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class Authservice {

  private readonly USER_KEY  = 'APP_USERS';
  private readonly LOGIN_KEY = 'APP_LOGIN';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private cartService: Cartservice | null = null;

  constructor(private injector: Injector) {
    this.initDefaultAccounts();
    this.currentUserSubject.next(this.getCurrentUser());
  }

  private getCartService(): Cartservice {
    if (!this.cartService) {
      this.cartService = this.injector.get(Cartservice);
    }
    return this.cartService;
  }

  // ── Init default accounts ─────────────────────────────────────────────────
  private initDefaultAccounts(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      const defaults: User[] = [
        {
          email: 'admin@roofi.com', password: 'admin123',
          fullname: 'Administrator', role: 'admin',
          provider: 'email', createdAt: new Date(), isActive: true
        },
        {
          email: 'khach1@test.com', password: '123456',
          fullname: 'Nguyễn Văn A', role: 'customer',
          provider: 'email', createdAt: new Date(), isActive: true
        },
        {
          email: 'khach2@test.com', password: '123456',
          fullname: 'Trần Thị B', role: 'customer',
          provider: 'email', createdAt: new Date(), isActive: true
        },
        {
          email: 'khach3@test.com', password: '123456',
          fullname: 'Lê Minh C', role: 'customer',
          provider: 'email', createdAt: new Date(), isActive: true
        },
        {
          email: 'customer@gmail.com', password: 'customer123',
          fullname: 'Customer Demo', role: 'customer',
          provider: 'email', createdAt: new Date(), isActive: true
        },
      ];
      localStorage.setItem(this.USER_KEY, JSON.stringify(defaults));
    } else {
      // Migration: đảm bảo mọi user cũ đều có isActive = true
      let changed = false;
      const migrated = users.map(u => {
        if (u.isActive === undefined) { changed = true; return { ...u, isActive: true }; }
        return u;
      });
      if (changed) localStorage.setItem(this.USER_KEY, JSON.stringify(migrated));
    }
  }

  // ── Sign up ───────────────────────────────────────────────────────────────
  signup(user: User): boolean {
    const users = this.getUsers();
    if (users.find(u => u.email === user.email)) return false;

    user.role     = 'customer';
    user.provider = 'email';
    user.createdAt = new Date();
    // FIX: tài khoản mới luôn active
    user.isActive = true;

    users.push(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(users));
    return true;
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  login(email: string, password: string): LoginResponse {
    const users = this.getUsers();
    const found = users.find(u => u.email === email && u.password === password);

    if (!found) {
      return { success: false, message: 'Email hoặc mật khẩu không đúng!' };
    }

    // FIX: kiểm tra tài khoản bị khóa (isActive = false)
    if (found.isActive === false) {
      return { success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!' };
    }

    const loginData = {
      email: found.email,
      role: found.role,
      fullname: found.fullname,
      provider: found.provider,
      createdAt: found.createdAt,
      avatarUrl: found.avatarUrl,
      isActive: found.isActive,
    };

    localStorage.setItem(this.LOGIN_KEY, JSON.stringify(loginData));
    this.getCartService().onUserLogin(found.email);
    this.currentUserSubject.next(found);

    return { success: true, user: found, message: 'Đăng nhập thành công!' };
  }

  // ── Social login ──────────────────────────────────────────────────────────
  socialLogin(email: string, fullname: string, provider: 'google' | 'facebook' | 'instagram'): LoginResponse {
    let users = this.getUsers();
    let found = users.find(u => u.email === email);

    if (!found) {
      found = { email, password: '', fullname, role: 'customer', provider, createdAt: new Date(), isActive: true };
      users.push(found);
      localStorage.setItem(this.USER_KEY, JSON.stringify(users));
    }

    // FIX: kiểm tra tài khoản bị khóa ngay cả với social login
    if (found.isActive === false) {
      return { success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!' };
    }

    const loginData = {
      email: found.email, role: found.role,
      fullname: found.fullname, provider: found.provider,
      createdAt: found.createdAt, avatarUrl: found.avatarUrl,
      isActive: found.isActive,
    };

    localStorage.setItem(this.LOGIN_KEY, JSON.stringify(loginData));
    this.getCartService().onUserLogin(found.email);
    this.currentUserSubject.next(found);

    return { success: true, user: found, message: `Đăng nhập thành công với ${provider}!` };
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  logout(): void {
    localStorage.removeItem(this.LOGIN_KEY);
    this.getCartService().onUserLogout();
    this.currentUserSubject.next(null);
  }

  // ── Reset password ────────────────────────────────────────────────────────
  resetPassword(email: string, newPassword: string): boolean {
    const users = this.getUsers();
    const found = users.find(u => u.email === email);
    if (!found) return false;
    found.password = newPassword;
    localStorage.setItem(this.USER_KEY, JSON.stringify(users));
    return true;
  }

  // ── Update profile ────────────────────────────────────────────────────────
  updateUserProfile(email: string, updates: Partial<User>): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.email === email);
    if (index === -1) return false;

    const { email: _omit, ...rest } = updates as any;
    const updatedUser = { ...users[index], ...rest } as User;
    users[index] = updatedUser;
    localStorage.setItem(this.USER_KEY, JSON.stringify(users));

    const loginDataRaw = localStorage.getItem(this.LOGIN_KEY);
    if (loginDataRaw) {
      const loginData = JSON.parse(loginDataRaw);
      if (loginData.email === email) {
        Object.assign(loginData, {
          fullname:  updatedUser.fullname,
          role:      updatedUser.role,
          provider:  updatedUser.provider,
          createdAt: updatedUser.createdAt,
          avatarUrl: updatedUser.avatarUrl,
          isActive:  updatedUser.isActive,
        });
        localStorage.setItem(this.LOGIN_KEY, JSON.stringify(loginData));
        this.currentUserSubject.next(updatedUser);
      }
    }
    return true;
  }

  /**
   * FIX: Đồng bộ isActive từ admin (MongoDB) → localStorage APP_USERS
   * Gọi sau khi admin save user thành công để login có thể check được.
   */
  syncUserActiveStatus(email: string, isActive: boolean): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return;

    users[idx].isActive = isActive;
    localStorage.setItem(this.USER_KEY, JSON.stringify(users));

    // Nếu user này đang đăng nhập, cập nhật luôn session
    const loginDataRaw = localStorage.getItem(this.LOGIN_KEY);
    if (loginDataRaw) {
      const loginData = JSON.parse(loginDataRaw);
      if (loginData.email.toLowerCase() === email.toLowerCase()) {
        loginData.isActive = isActive;
        localStorage.setItem(this.LOGIN_KEY, JSON.stringify(loginData));
        if (!isActive) {
          // Kick user ra nếu đang đăng nhập mà bị khóa
          this.logout();
        }
      }
    }
  }

  // ── Getters ───────────────────────────────────────────────────────────────
  getCurrentUser(): any {
    const loginDataRaw = localStorage.getItem(this.LOGIN_KEY);
    if (!loginDataRaw) return null;
    const loginData = JSON.parse(loginDataRaw);
    const users = this.getUsers();
    const user = users.find(u => u.email === loginData.email);
    return user ? { ...loginData, ...user } : loginData;
  }

  isAdmin():    boolean { return this.getCurrentUser()?.role === 'admin'; }
  isCustomer(): boolean { return this.getCurrentUser()?.role === 'customer'; }
  isLoggedIn(): boolean { return !!localStorage.getItem(this.LOGIN_KEY); }

  private getUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.USER_KEY) || '[]');
  }
}