import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Authservice, LoginResponse } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  remember = false;
  showPassword = false;
  isSubmitting = false;
  googleClientId = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'; // Thay đổi tại đây

  constructor(
    private authService: Authservice,
    private notify: Notificationservice,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeGoogleSignIn();
  }

  // ========================================
  // INITIALIZE GOOGLE SIGN-IN
  // ========================================
  private initializeGoogleSignIn(): void {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Khởi tạo Google Sign-In button
      if (typeof google !== 'undefined' && google.accounts) {
        try {
          google.accounts.id.initialize({
            client_id: this.googleClientId,
            callback: (response: any) => this.handleGoogleCallback(response),
            auto_select: false,
            cancel_on_tap_outside: true
          });
          console.log('[GoogleAuth] ✅ Google Sign-In initialized');
        } catch (error) {
          console.error('[GoogleAuth] ❌ Failed to initialize:', error);
        }
      }
    };
    document.head.appendChild(script);
  }

  // ========================================
  // HANDLE GOOGLE CALLBACK
  // ========================================
  private handleGoogleCallback(response: any): void {
    try {
      if (!response.credential) {
        this.notify.error('Google authentication failed');
        return;
      }

      // Decode JWT token để lấy thông tin user
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      console.log('[GoogleAuth] Decoded token:', {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });

      // Gọi socialLogin từ AuthService
      this.isSubmitting = true;
      const result = this.authService.socialLogin(
        payload.email,
        payload.name,
        'google'
      );

      if (result.success) {
        this.notify.success('Đăng nhập Google thành công! 🎉');
        console.log('[GoogleAuth] ✅ Login success:', payload.email);

        // Redirect sau 1 giây
        setTimeout(() => {
          const redirectUrl = localStorage.getItem('redirectUrl') || '/';
          localStorage.removeItem('redirectUrl');
          this.router.navigate([redirectUrl]);
        }, 1000);
      } else {
        this.notify.error(result.message || 'Google login failed');
        this.isSubmitting = false;
      }
    } catch (error) {
      console.error('[GoogleAuth] ❌ Error:', error);
      this.notify.error('Lỗi khi xử lý đăng nhập Google');
      this.isSubmitting = false;
    }
  }

  // ========================================
  // GOOGLE LOGIN BUTTON CLICK
  // ========================================
  onGoogleLogin(): void {
    // Hiển thị thông báo demo
    this.notify.info(' Chức năng demo - Đăng nhập Google chưa được tích hợp. Vui lòng sử dụng form đăng nhập bên trên!');
    return;
    
    /* Original Google login code - comment out for demo
    if (typeof google !== 'undefined' && google.accounts) {
      try {
        // Hiển thị Google Sign-In dialog
        google.accounts.id.renderButton(
          document.getElementById('google-button'),
          {
            type: 'standard',
            size: 'large',
            locale: 'vi',
            width: '100%',
            theme: 'outline',
            text: 'signin'
          }
        );

        // Click button ẩn để trigger OAuth flow
        const googleButton = document.querySelector('#google-button button') as HTMLButtonElement;
        if (googleButton) {
          googleButton.click();
        }
      } catch (error) {
        console.error('[GoogleAuth] ❌ Button click failed:', error);
        this.notify.error('Không thể mở Google Sign-In');
      }
    } else {
      console.warn('[GoogleAuth] Google SDK not loaded yet');
      this.notify.info('Google Sign-In đang tải, vui lòng thử lại...');
    }
    */
  }

  // ========================================
  // EMAIL LOGIN BUTTON CLICK
  // ========================================
  onEmailLogin(): void {
    // Hiển thị thông báo demo
    this.notify.info(' Chức năng demo - Vui lòng sử dụng form đăng nhập bên trên!');
  }

  // ========================================
  // TOGGLE PASSWORD VISIBILITY
  // ========================================
  togglePassword(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      if (input.type === 'password') {
        input.type = 'text';
        this.showPassword = true;
      } else {
        input.type = 'password';
        this.showPassword = false;
      }
    }
  }

  // ========================================
  // LOGIN FORM SUBMIT
  // ========================================
  onLoginSubmit(event: Event) {
    event.preventDefault();

    // Validate
    if (!this.email || !this.password) {
      this.notify.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.notify.error('Email không hợp lệ!');
      return;
    }

    this.isSubmitting = true;

    // Login với AuthService
    const result: LoginResponse = this.authService.login(this.email, this.password);

    if (result.success && result.user) {
      this.notify.success(result.message || 'Đăng nhập thành công!');

      // Lưu remember me
      if (this.remember) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirect dựa vào role
      setTimeout(() => {
        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
        localStorage.removeItem('redirectUrl');

        if (result.user?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate([redirectUrl]);
        }
      }, 1000);
    } else {
      this.notify.error(result.message || 'Đăng nhập thất bại!');
      this.isSubmitting = false;
    }
  }
}
