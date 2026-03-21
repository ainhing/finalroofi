import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Notificationservice } from '../../services/notificationservice';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
})
export class ForgotPassword implements OnInit, AfterViewInit {
  email = '';
  showOTPForm = false;
  otp: string[] = ['', '', '', '', '', ''];
  @ViewChild('otpContainer') otpContainer!: ElementRef;
  otpInputs: HTMLInputElement[] = [];
  isSubmitting = false;
  isVerifying = false;

  constructor(
    private notify: Notificationservice,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize OTP array
    this.otp = ['', '', '', '', '', ''];
  }

  ngAfterViewInit() {
    // Get all OTP inputs after view init
    if (this.otpContainer) {
      this.otpInputs = Array.from(
        this.otpContainer.nativeElement.querySelectorAll('.otp-input')
      ) as HTMLInputElement[];
    }
  }

  // ========================================
  // FORGOT PASSWORD FORM SUBMIT
  // ========================================
  onForgotPasswordSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.email) {
      this.notify.error('Vui lòng nhập email!');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.notify.error('Email không hợp lệ!');
      return;
    }

    this.isSubmitting = true;

    // TODO: Gửi mã OTP đến email
    console.log('Send OTP to:', this.email);
    
    // Demo: Hiện form nhập mã OTP
    setTimeout(() => {
      this.notify.success('Mã xác nhận đã được gửi đến email của bạn! 📧');
      this.showOTPForm = true;
      this.isSubmitting = false;
      
      // Focus vào OTP input đầu tiên
      setTimeout(() => {
        if (this.otpInputs.length > 0) {
          this.otpInputs[0].focus();
        }
      }, 100);
    }, 1000);
  }

  // ========================================
  // OTP INPUT HANDLERS
  // ========================================
  onOTPInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    
    // Chỉ cho phép nhập số
    input.value = input.value.replace(/[^0-9]/g, '');
    this.otp[index] = input.value;
    
    // Auto focus sang ô tiếp theo
    if (input.value.length === 1 && index < this.otpInputs.length - 1) {
      this.otpInputs[index + 1].focus();
    }
  }

  onOTPKeyDown(event: KeyboardEvent, index: number) {
    // Xử lý backspace
    if (event.key === 'Backspace' && this.otp[index] === '' && index > 0) {
      this.otpInputs[index - 1].focus();
    }
  }

  // ========================================
  // VERIFY CODE FORM SUBMIT
  // ========================================
  onVerifyCodeSubmit(event: Event) {
    event.preventDefault();
    
    // Lấy mã OTP
    const otpCode = this.otp.join('');
    
    if (otpCode.length !== 6) {
      this.notify.error('Vui lòng nhập đầy đủ 6 số!');
      return;
    }

    this.isVerifying = true;

    // TODO: Verify OTP với server
    console.log('Verify OTP:', otpCode);
    
    // Demo: Giả lập xác nhận thành công
    setTimeout(() => {
      this.notify.success('Xác nhận thành công! ✅');
      
      // Lưu email vào localStorage để reset password
      localStorage.setItem('resetPasswordEmail', this.email);
      
      // Chuyển sang trang reset password
      setTimeout(() => {
        this.router.navigate(['/reset-password']);
      }, 1000);
    }, 1000);
  }

  // ========================================
  // RESEND CODE
  // ========================================
  onResendCode(event: Event) {
    event.preventDefault();
    
    // TODO: Gửi lại mã OTP
    console.log('Resend OTP');
    
    // Reset OTP inputs
    this.otp = ['', '', '', '', '', ''];
    if (this.otpInputs.length > 0) {
      this.otpInputs.forEach(input => input.value = '');
      this.otpInputs[0].focus();
    }
    
    this.notify.info('Mã xác nhận mới đã được gửi! 📧');
  }
}
