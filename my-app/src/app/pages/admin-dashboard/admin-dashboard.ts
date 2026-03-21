import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { Userservice } from '../../services/userservice';
import { Orderservice } from '../../services/orderservice';
import { Productservice } from '../../services/productservice';

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css'],
})
export class AdminDashboard implements OnInit {
  user: any = null;

  totalUsers    = 0;
  totalOrders   = 0;
  totalRevenue  = 0;
  totalProducts = 0;

  isLoadingStats = false;

  constructor(
    private authService:    Authservice,
    private notify:         Notificationservice,
    private router:         Router,
    private userService:    Userservice,
    private orderService:   Orderservice,
    private productService: Productservice,
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user || this.user.role !== 'admin') {
      this.notify.error('Bạn không có quyền truy cập trang này!');
      this.router.navigate(['/']);
      return;
    }
    this.loadStats();
  }

  private toArray(res: any): any[] {
    if (Array.isArray(res))            return res;
    if (Array.isArray(res?.data))      return res.data;
    if (Array.isArray(res?.users))     return res.users;
    if (Array.isArray(res?.products))  return res.products;
    if (Array.isArray(res?.orders))    return res.orders;
    return [];
  }

  loadStats() {
    this.isLoadingStats = true;

    this.userService.getUsers().subscribe({
      next:  (res) => { this.totalUsers = this.toArray(res).length; },
      error: ()    => { this.totalUsers = 0; }
    });

    this.orderService.getOrders().subscribe({
      next: (res) => {
        const list = this.toArray(res);
        this.totalOrders  = list.length;
        this.totalRevenue = list.reduce(
          (sum: number, o: any) => sum + (Number(o.TotalAmount) || 0), 0
        );
        this.isLoadingStats = false;
      },
      error: () => {
        this.totalOrders   = 0;
        this.totalRevenue  = 0;
        this.isLoadingStats = false;
      }
    });

    // FIX: getProducts() trả về mảng sections, phải flatten để đếm đúng
    this.productService.getProducts().subscribe({
      next: (sections) => {
        const arr = this.toArray(sections);
        this.totalProducts = arr.reduce(
          (sum: number, section: any) =>
            sum + (Array.isArray(section.products) ? section.products.length : 0),
          0
        );
      },
      error: () => { this.totalProducts = 0; }
    });
  }

  formatRevenue(value: number): string {
    if (!value) return '0 ₫';
    if (value >= 1_000_000_000)
      return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + ' tỷ ₫';
    if (value >= 1_000_000)
      return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' tr ₫';
    return value.toLocaleString('vi-VN') + ' ₫';
  }

  onManageUsers()    { this.router.navigate(['/admin/users']);    }
  onManageOrders()   { this.router.navigate(['/admin/orders']);   }
  onManageProducts() { this.router.navigate(['/admin/products']); }
  onManageBlogs()    { this.router.navigate(['/admin/blogs']);    }

  onLogout() {
    this.authService.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }
}