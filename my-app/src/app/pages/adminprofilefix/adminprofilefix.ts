import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { Userservice } from '../../services/userservice';
import { AppUser, UserStateService } from '../../services/user-stateservice';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-adminprofilefix',
  standalone: false,
  templateUrl: './adminprofilefix.html',
  styleUrl: './adminprofilefix.css',
  encapsulation: ViewEncapsulation.None,
})
export class Adminprofilefix implements OnInit {
  user: any = null;

  userId = '';
  form: AppUser | any = null;

  isLoading  = true;
  isSaving   = false;
  isDeleting = false;

  selectedFile: File | null = null;
  isUploading  = false;

  constructor(
    private route:       ActivatedRoute,
    private router:      Router,
    private authService: Authservice,
    private notify:      Notificationservice,
    private userService: Userservice,
    private userState:   UserStateService,
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user || this.user.role !== 'admin') {
      this.notify.error('Bạn không có quyền truy cập trang này!');
      this.router.navigate(['/']);
      return;
    }

    this.route.params.subscribe(params => {
      this.userId = params['id'];

      if (this.userId === 'new') {
        const id = this.generateUserId();
        this.form = {
          id, UserId: id, email: '', fullname: '',
          role: 'customer', provider: 'email',
          avatarUrl: '', isActive: true,
          createdAt: new Date().toISOString(),
        };
        this.isLoading = false;
        return;
      }

      this.loadUserFast();
    });
  }

  loadUserFast() {
    this.isLoading = false;

    if (!this.form) {
      this.form = {
        id: this.userId, UserId: this.userId,
        email: '', fullname: '', role: 'customer',
        provider: 'email', avatarUrl: '', isActive: true,
      };
    }

    const found = this.userState.getUsersSync()
      .find(u => u.UserId === this.userId || u.id === this.userId);

    if (found) { this.form = { ...found }; return; }

    this.userService.getUserById(this.userId).subscribe({
      next: (u) => {
        if (!u) {
          this.notify.error('User không tồn tại');
          this.router.navigate(['/admin/users']);
          return;
        }
        this.form = { ...u };
      },
      error: (err: HttpErrorResponse) => {
        const msg = err?.error?.message || err?.message || 'Lỗi không xác định';
        this.notify.error('Không thể tải user: ' + msg);
        this.router.navigate(['/admin/users']);
      }
    });
  }

  // ── Avatar ────────────────────────────────────────────────────────────────

  onFileChange(event: any) {
    this.selectedFile = event.target?.files?.[0] || null;
  }

  uploadAvatar() {
    if (!this.selectedFile) { this.notify.error('Vui lòng chọn file ảnh'); return; }

    this.isUploading = true;
    this.userService.uploadAvatar(this.selectedFile).subscribe({
      next: (res: any) => {
        if (res?.path && this.form) {
          this.form.avatarUrl = res.path;
          this.notify.success('Upload ảnh thành công');
          this.selectedFile = null;
        } else {
          this.notify.error('Upload thất bại: không nhận được đường dẫn');
        }
        this.isUploading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.notify.error('Upload ảnh thất bại: ' + (err?.error?.message || err?.message));
        this.isUploading = false;
      }
    });
  }

  removeAvatar() {
    if (this.form) this.form.avatarUrl = '';
    this.selectedFile = null;
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  save() {
    if (!this.form?.email?.trim()) {
      this.notify.error('Vui lòng nhập email'); return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.form.email.trim())) {
      this.notify.error('Email không hợp lệ'); return;
    }

    this.isSaving = true;

    const payload = {
      UserId:      this.form.UserId,
      Email:       this.form.email.trim(),
      DisplayName: (this.form.fullname || '').trim(),
      Role:        this.form.role,
      Provider:    this.form.provider || 'email',
      AvatarUrl:   this.form.avatarUrl || '',
      // FIX: truyền IsActive đúng kiểu boolean
      IsActive:    !!this.form.isActive,
    };

    if (this.userId === 'new') {
      this.userService.createUser(payload).subscribe({
        next: () => {
          this.notify.success('Tạo user thành công');
          this.isSaving = false;
          this.router.navigate(['/admin/users']);
        },
        error: (err: HttpErrorResponse) => {
          this.notify.error('Tạo user thất bại: ' + (err?.error?.message || err?.message));
          this.isSaving = false;
        }
      });
    } else {
      this.userService.updateUser(this.userId, payload).subscribe({
        next: () => {
          this.notify.success('Cập nhật user thành công');

          // ── FIX: Đồng bộ isActive về localStorage APP_USERS ──────────────
          // Khi admin khóa/mở khóa tài khoản, login() sẽ đọc từ localStorage.
          // syncUserActiveStatus() cập nhật ngay và kick user ra nếu đang active.
          this.authService.syncUserActiveStatus(
            this.form.email.trim(),
            !!this.form.isActive,
          );

          this.isSaving = false;
          this.router.navigate(['/admin/users']);
        },
        error: (err: HttpErrorResponse) => {
          this.notify.error('Cập nhật user thất bại: ' + (err?.error?.message || err?.message));
          this.isSaving = false;
        }
      });
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  delete() {
    if (!this.form?.UserId || this.userId === 'new') {
      this.notify.error('Không thể xóa user chưa tạo'); return;
    }
    if (!confirm(`Xóa user ${this.form.email}?`)) return;

    this.isDeleting = true;
    this.userService.deleteUser(this.form.UserId).subscribe({
      next: () => {
        this.notify.success('Đã xóa user');
        this.isDeleting = false;
        this.router.navigate(['/admin/users']);
      },
      error: (err: HttpErrorResponse) => {
        this.notify.error('Xóa user thất bại: ' + (err?.error?.message || err?.message));
        this.isDeleting = false;
      }
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  goBack() { this.router.navigate(['/admin/users']); }

  onLogout() {
    this.authService.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }

  private generateUserId(): string {
    return `USER_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}