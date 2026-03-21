import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Authservice } from '../services/authservice';

// Guard để bảo vệ routes yêu cầu đăng nhập
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Authservice);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Lưu URL để redirect sau khi login
  localStorage.setItem('redirectUrl', state.url);
  router.navigate(['/login']);
  return false;
};

// Guard để bảo vệ routes chỉ dành cho customer
export const customerGuard: CanActivateFn = (route, state) => {
  const authService = inject(Authservice);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    localStorage.setItem('redirectUrl', state.url);
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (user?.role === 'customer') {
    return true;
  }

  router.navigate(['/']);
  return false;
};

// Guard để bảo vệ routes chỉ dành cho admin
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(Authservice);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    localStorage.setItem('redirectUrl', state.url);
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (user?.role === 'admin') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
