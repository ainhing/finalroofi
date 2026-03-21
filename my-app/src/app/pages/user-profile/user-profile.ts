import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.html',
})
export class UserProfile implements OnInit {
  user: any = null;
  isEditMode = false;
  
  // Form fields
  editName = '';
  editCurrentPassword = '';
  editNewPassword = '';
  editConfirmPassword = '';
  editAvatarUrl = '';
  avatarModalOpen = false;
  avatarTempUrl = '';
  avatarZoom = 1;
  private avatarImage: HTMLImageElement | null = null;
  private readonly avatarOutputSize = 256;
  private readonly avatarPreviewSize = 240;
  
  // Submit state
  isSubmitting = false;

  constructor(
    private authService: Authservice,
    private notify: Notificationservice,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    
    if (!this.user) {
      this.router.navigate(['/login']);
    } else {
      this.editName = this.user.fullname || '';
      this.editAvatarUrl = this.user.avatarUrl || '';
    }
  }

  // ========================================
  // TOGGLE EDIT MODE
  // ========================================
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.resetForm();
    }
  }

  resetForm() {
    this.editName = this.user.fullname || '';
    this.editCurrentPassword = '';
    this.editNewPassword = '';
    this.editConfirmPassword = '';
    this.editAvatarUrl = this.user.avatarUrl || '';
  }

  // ========================================
  // AVATAR UPLOAD
  // ========================================
  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.notify.error('Vui lòng chọn file ảnh hợp lệ!');
      input.value = '';
      return;
    }

    // Open modal immediately
    this.avatarModalOpen = true;
    this.avatarZoom = 1;

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarTempUrl = reader.result as string;
      this.avatarImage = new Image();
      this.avatarImage.src = this.avatarTempUrl;
    };
    reader.readAsDataURL(file);

    // allow selecting the same file again
    input.value = '';
  }

  closeAvatarModal() {
    this.avatarModalOpen = false;
  }

  getAvatarPreviewStyle() {
    if (!this.avatarTempUrl || !this.avatarImage) {
      return {};
    }

    const imgW = this.avatarImage.naturalWidth || 1;
    const imgH = this.avatarImage.naturalHeight || 1;
    const baseScale = Math.max(this.avatarPreviewSize / imgW, this.avatarPreviewSize / imgH);
    const scale = baseScale * this.avatarZoom;
    const bgW = imgW * scale;
    const bgH = imgH * scale;

    return {
      backgroundImage: `url('${this.avatarTempUrl}')`,
      backgroundSize: `${bgW}px ${bgH}px`,
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat'
    };
  }

  saveAvatarCrop() {
    if (!this.avatarImage) {
      this.notify.error('Không thể xử lý ảnh. Vui lòng thử lại!');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.avatarOutputSize;
    canvas.height = this.avatarOutputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.notify.error('Không thể xử lý ảnh. Vui lòng thử lại!');
      return;
    }

    const imgW = this.avatarImage.naturalWidth || 1;
    const imgH = this.avatarImage.naturalHeight || 1;
    const baseScale = Math.max(this.avatarOutputSize / imgW, this.avatarOutputSize / imgH);
    const scale = baseScale * this.avatarZoom;
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const dx = (this.avatarOutputSize - drawW) / 2;
    const dy = (this.avatarOutputSize - drawH) / 2;

    ctx.clearRect(0, 0, this.avatarOutputSize, this.avatarOutputSize);
    ctx.drawImage(this.avatarImage, dx, dy, drawW, drawH);

    this.editAvatarUrl = canvas.toDataURL('image/png');
    this.avatarModalOpen = false;
  }

  // ========================================
  // UPDATE PROFILE
  // ========================================
  onUpdateProfile(event: Event) {
    event.preventDefault();
    
    // Validate name
    if (!this.editName.trim()) {
      this.notify.error('Vui lòng nhập họ và tên!');
      return;
    }

    if (this.editName.trim().length < 3) {
      this.notify.error('Họ và tên phải có ít nhất 3 ký tự!');
      return;
    }

    // If changing password, validate
    if (this.editNewPassword.trim()) {
      if (!this.editCurrentPassword.trim()) {
        this.notify.error('Vui lòng nhập mật khẩu hiện tại!');
        return;
      }

      if (this.editNewPassword.length < 6) {
        this.notify.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
        return;
      }

      if (this.editNewPassword !== this.editConfirmPassword) {
        this.notify.error('Mật khẩu xác nhận không khớp!');
        return;
      }

      // Check current password
      const allUsers = (JSON.parse(localStorage.getItem('APP_USERS') || '[]') as any[]);
      const userRecord = allUsers.find(u => u.email === this.user.email);
      
      if (!userRecord || userRecord.password !== this.editCurrentPassword) {
        this.notify.error('Mật khẩu hiện tại không chính xác!');
        return;
      }
    }

    this.isSubmitting = true;

    // Prepare updates
    const updates: any = {
      fullname: this.editName.trim(),
      avatarUrl: this.editAvatarUrl
    };

    if (this.editNewPassword.trim()) {
      updates.password = this.editNewPassword.trim();
    }

    // Update profile
    const success = this.authService.updateUserProfile(this.user.email, updates);

    if (success) {
      // Reload user data
      this.user = this.authService.getCurrentUser();
      this.isEditMode = false;
      this.resetForm();
      this.notify.success('Cập nhật thông tin thành công!');
    } else {
      this.notify.error('Cập nhật thông tin thất bại!');
    }

    this.isSubmitting = false;
  }

  // ========================================
  // LOGOUT
  // ========================================
  onLogout() {
    this.authService.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }

  // ========================================
  // FORMAT DATE
  // ========================================
  formatDate(date: any): string {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(d.getTime())) {
        return 'N/A';
      }
      // Format theo định dạng ngày/tháng/năm
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return 'N/A';
    }
  }
}
