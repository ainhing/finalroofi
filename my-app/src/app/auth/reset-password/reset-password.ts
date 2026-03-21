import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.html',
})
export class ResetPassword implements OnInit {
  newPassword = '';
  confirmNewPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  
  // Password strength
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';
  strengthText = 'Nhập mật khẩu';
  strengthColor = '#f44336';
  
  // Password requirements
  reqLength = false;
  reqUppercase = false;
  reqLowercase = false;
  reqNumber = false;

  constructor(
    private authService: Authservice,
    private notify: Notificationservice,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user came from forgot password
    const resetEmail = localStorage.getItem('resetPasswordEmail');
    if (!resetEmail) {
      // Redirect to login if no email found
      this.router.navigate(['/login']);
    }
  }

  // ========================================
  // TOGGLE PASSWORD VISIBILITY
  // ========================================
  togglePassword(inputId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      if (input.type === 'password') {
        input.type = 'text';
        if (inputId === 'new-password') {
          this.showNewPassword = true;
        } else if (inputId === 'confirm-new-password') {
          this.showConfirmPassword = true;
        }
      } else {
        input.type = 'password';
        if (inputId === 'new-password') {
          this.showNewPassword = false;
        } else if (inputId === 'confirm-new-password') {
          this.showConfirmPassword = false;
        }
      }
    }
  }

  // ========================================
  // PASSWORD STRENGTH CHECKER
  // ========================================
  checkPasswordStrength(password: string) {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) {
      this.passwordStrength = 'weak';
      this.strengthText = 'Mật khẩu yếu';
      this.strengthColor = '#f44336';
    } else if (strength <= 4) {
      this.passwordStrength = 'medium';
      this.strengthText = 'Mật khẩu trung bình';
      this.strengthColor = '#ff9800';
    } else {
      this.passwordStrength = 'strong';
      this.strengthText = 'Mật khẩu mạnh';
      this.strengthColor = '#4caf50';
    }
  }

  // ========================================
  // PASSWORD REQUIREMENTS CHECKER
  // ========================================
  checkPasswordRequirements(password: string) {
    this.reqLength = password.length >= 6;
    this.reqUppercase = /[A-Z]/.test(password);
    this.reqLowercase = /[a-z]/.test(password);
    this.reqNumber = /[0-9]/.test(password);
  }

  // ========================================
  // ON PASSWORD INPUT
  // ========================================
  onPasswordInput() {
    this.checkPasswordStrength(this.newPassword);
    this.checkPasswordRequirements(this.newPassword);
  }

  // ========================================
  // RESET PASSWORD FORM SUBMIT
  // ========================================
  onResetPasswordSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.newPassword || !this.confirmNewPassword) {
      this.notify.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    if (this.newPassword !== this.confirmNewPassword) {
      this.notify.error('Mật khẩu không khớp!');
      return;
    }
    
    if (this.newPassword.length < 6) {
      this.notify.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    this.isSubmitting = true;

    // Get email from localStorage
    const resetEmail = localStorage.getItem('resetPasswordEmail');
    if (!resetEmail) {
      this.notify.error('Không tìm thấy email!');
      this.router.navigate(['/login']);
      return;
    }

    // TODO: Gửi mật khẩu mới đến server
    // Demo: Sử dụng Authservice
    const success = this.authService.resetPassword(resetEmail, this.newPassword);
    
    if (success) {
      this.notify.success('Đặt lại mật khẩu thành công! ✅');
      
      // Clear reset email
      localStorage.removeItem('resetPasswordEmail');
      
      // Chuyển về trang login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    } else {
      this.notify.error('Không tìm thấy tài khoản với email này!');
      this.isSubmitting = false;
    }
  }
}
