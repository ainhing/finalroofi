import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { AppOrder, OrderStatus } from '../../services/orderstateservice';
import { Orderservice } from '../../services/orderservice';

@Component({
  selector: 'app-admin-orders',
  standalone: false,
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders implements OnInit {
  user: any = null;
  orders: AppOrder[]         = [];
  filteredOrders: AppOrder[] = [];
  isLoading = false;

  // Filter
  filterStatus = '';
  filterSearch = '';

  readonly statusList: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

  readonly statusLabel: Record<string, string> = {
    pending:   'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping:  'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  constructor(
    private auth: Authservice,
    private notify: Notificationservice,
    private router: Router,
    private orderService: Orderservice
  ) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    if (!this.user || this.user.role !== 'admin') {
      this.notify.error('Bạn không có quyền truy cập trang này!');
      this.router.navigate(['/']);
      return;
    }
    this.loadOrders();
  }

  loadOrders(force = false) {
    this.isLoading = true;
    this.orderService.getOrders(force).subscribe({
      next: (list) => {
        this.orders = list || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.notify.error('Không thể tải danh sách đơn hàng');
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    let result = [...this.orders];
    if (this.filterStatus) {
      result = result.filter(o => o.Status === this.filterStatus);
    }
    if (this.filterSearch.trim()) {
      const q = this.filterSearch.trim().toLowerCase();
      result = result.filter(o =>
        o.OrderId.toLowerCase().includes(q) ||
        o.Email.toLowerCase().includes(q) ||
        o.FullName.toLowerCase().includes(q)
      );
    }
    this.filteredOrders = result;
  }

  onFilterChange() {
    this.applyFilter();
  }

  onViewOrder(o: AppOrder) {
    this.router.navigate(['/admin/orders/fix', o.OrderId]);
  }

  onDeleteOrder(o: AppOrder) {
    if (!confirm(`Xóa đơn hàng ${o.OrderId}?`)) return;
    this.orderService.deleteOrder(o.OrderId).subscribe({
      next: () => {
        this.notify.success('Đã xóa đơn hàng');
        this.loadOrders(true);
      },
      error: (err) => {
        console.error(err);
        this.notify.error('Xóa đơn hàng thất bại');
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  formatCurrency(val: number): string {
    if (!val && val !== 0) return 'N/A';
    return val.toLocaleString('vi-VN') + 'đ';
  }

  // Tổng theo status để hiển thị badge count ở filter
  countByStatus(status: string): number {
    return this.orders.filter(o => o.Status === status).length;
  }
  onLogout() {
    this.auth.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }
}