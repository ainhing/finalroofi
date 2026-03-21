import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { Userservice } from '../../services/userservice';
import { AppUser } from '../../services/user-stateservice';

@Component({
  selector: 'app-admin-profile',
  standalone: false,
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css',
  encapsulation: ViewEncapsulation.None,
})
export class AdminProfile implements OnInit {
  user: any = null;
  users: AppUser[] = [];
  isLoading = false;

  constructor(
    private authService: Authservice,
    private notify: Notificationservice,
    private router: Router,
    private userService: Userservice
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user || this.user.role !== 'admin') {
      this.notify.error('Bạn không có quyền truy cập trang này!');
      this.router.navigate(['/']);
      return;
    }
    this.loadUsers();
  }

  loadUsers(force = false) {
    this.isLoading = true;
    this.userService.getUsers(force).subscribe({
      next: (list) => {
        this.users = list || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.notify.error('Không thể tải danh sách user');
        this.isLoading = false;
      }
    });
  }

  onAddUser() {
    // FIX: đúng route /admin/users/fix/new
    this.router.navigate(['/admin/users/fix', 'new']);
  }

  onEditUser(u: AppUser) {
    // FIX: đúng route /admin/users/fix/:id
    this.router.navigate(['/admin/users/fix', u.UserId]);
  }

  onDeleteUser(u: AppUser) {
    if (!confirm(`Xóa user ${u.email}?`)) return;
    this.userService.deleteUser(u.UserId).subscribe({
      next: () => {
        this.notify.success('Đã xóa user');
        // FIX: reload lại danh sách sau khi xóa
        this.loadUsers(true);
      },
      error: (err) => {
        console.error(err);
        this.notify.error('Xóa user thất bại');
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  onLogout() {
    this.authService.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }
}