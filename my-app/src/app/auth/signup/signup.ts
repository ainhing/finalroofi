import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { Userservice } from '../../services/userservice';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.html',
})
export class Signup {
  fullname        = '';
  email           = '';
  phone           = '';
  password        = '';
  confirmPassword = '';
  terms           = false;
  showPassword    = false;
  showConfirmPassword = false;
  isSubmitting    = false;

  constructor(
    private authService:  Authservice,
    private notify:       Notificationservice,
    private router:       Router,
    // FIX: inject Userservice để đồng bộ user mới lên MongoDB
    private userService:  Userservice,
  ) {}

  togglePassword(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    if (inputId === 'password')          this.showPassword        = !isText;
    if (inputId === 'confirm-password')  this.showConfirmPassword = !isText;
  }

  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.fullname || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.notify.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.notify.error('Mật khẩu không khớp!');
      return;
    }

    if (this.password.length < 6) {
      this.notify.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (!this.terms) {
      this.notify.error('Vui lòng đồng ý với điều khoản sử dụng!');
      return;
    }

    this.isSubmitting = true;

    // ── Bước 1: Lưu vào localStorage (authservice) ────────────────────────
    const localOk = this.authService.signup({
      email:    this.email.trim().toLowerCase(),
      password: this.password,
      fullname: this.fullname.trim(),
      role:     'customer',
      isActive: true,
    });

    if (!localOk) {
      this.notify.error('Email đã được sử dụng!');
      this.isSubmitting = false;
      return;
    }

    // ── Bước 2: Đồng bộ lên MongoDB qua backend API ───────────────────────
    const payload = {
      Email:       this.email.trim().toLowerCase(),
      DisplayName: this.fullname.trim(),
      Password:    this.password,          // backend lưu hash hoặc plain tùy cấu hình
      Role:        'customer',
      Provider:    'email',
      Phone:       this.phone.trim(),
      IsActive:    true,
    };

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.notify.success('Đăng ký thành công! Vui lòng đăng nhập.');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        // 409 = email đã tồn tại trong DB (user đăng ký trước đó) — không phải lỗi nghiêm trọng
        if (err?.status === 409) {
          this.notify.success('Đăng ký thành công! Vui lòng đăng nhập.');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          // Đăng ký local thành công nhưng backend lỗi → vẫn cho đăng nhập được
          console.warn('Sync to backend failed:', err);
          this.notify.success('Đăng ký thành công! (Lưu ý: đồng bộ backend thất bại)');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        }
      }
    });
  }

  onSocialLogin(provider: string) {
    this.notify.info(`Đăng ký với ${provider} (Chức năng demo)`);
  }
}