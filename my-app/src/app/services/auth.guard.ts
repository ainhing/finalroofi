import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservice } from '../services/authservice';

/**
 * customerGuard — cho phép cả customer VÀ admin truy cập.
 * Yêu cầu duy nhất: phải đăng nhập.
 * Admin cần được mua hàng, xem lịch sử, xem order-confirm bình thường.
 */
export const customerGuard: CanActivateFn = () => {
  const auth   = inject(Authservice);
  const router = inject(Router);
  const user   = auth.getCurrentUser();

  if (user && (user.role === 'customer' || user.role === 'admin')) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * adminGuard — chỉ admin mới được vào.
 */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(Authservice);
  const router = inject(Router);
  const user   = auth.getCurrentUser();

  if (user && user.role === 'admin') {
    return true;
  }

  // Nếu đã đăng nhập nhưng không phải admin → về trang chủ
  if (user) {
    router.navigate(['/']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};