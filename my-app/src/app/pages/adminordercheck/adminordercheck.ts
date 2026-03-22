import { Component, OnInit } from '@angular/core';
import { AppOrder, OrderStateService, OrderStatus } from '../../services/orderstateservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { Orderservice } from '../../services/orderservice';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-adminordercheck',
  standalone: false,
  templateUrl: './adminordercheck.html',
  styleUrl: './adminordercheck.css',
})
export class Adminordercheck implements OnInit {
  user: any = null;
  orderId  = '';
  order: AppOrder | any = null;

  isLoading  = true;
  isSaving   = false;
  isDeleting = false;

  readonly statusList: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

  readonly statusLabel: Record<string, string> = {
    pending:   'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping:  'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  // Timeline steps hiển thị tiến trình đơn hàng
  readonly statusTimeline: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'delivered'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: Authservice,
    private notify: Notificationservice,
    private orderService: Orderservice,
    private orderState: OrderStateService
  ) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    if (!this.user || this.user.role !== 'admin') {
      this.notify.error('Bạn không có quyền truy cập trang này!');
      this.router.navigate(['/']);
      return;
    }

    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      this.loadOrderFast();
    });
  }

  loadOrderFast() {
    this.isLoading = false;

    // Khởi tạo order trống để UI không bị null
    if (!this.order) {
      this.order = { OrderId: this.orderId, Items: [], Status: 'pending' };
    }

    // 1) State trước (instant)
    const found = this.orderState.getOrdersSync().find((o) => o.OrderId === this.orderId);
    if (found) {
      this.order = { ...found };
      return;
    }

    // 2) Fallback API
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (o) => {
        if (!o) {
          this.notify.error('Đơn hàng không tồn tại');
          this.router.navigate(['/admin/orders']);
          return;
        }
        this.order = { ...o };
      },
      error: (err: HttpErrorResponse) => {
        const msg = err?.error?.message || err?.message || 'Lỗi không xác định';
        console.error('loadOrder error:', err);
        this.notify.error('Không thể tải đơn hàng: ' + msg);
        this.router.navigate(['/admin/orders']);
      }
    });
  }

  save() {
    if (!this.order?.Status) {
      this.notify.error('Vui lòng chọn trạng thái');
      return;
    }

    this.isSaving = true;
    const payload = {
      Status: this.order.Status,
      Note:   (this.order.Note || '').trim(),
    };

    this.orderService.updateOrder(this.orderId, payload).subscribe({
      next: (res) => {
        const updated = res?.order || { ...this.order, ...payload };
        this.orderState.updateOrder(updated);
        this.notify.success('Cập nhật đơn hàng thành công');
        this.isSaving = false;
      },
      error: (err: HttpErrorResponse) => {
        const msg = err?.error?.message || err?.message || 'Lỗi không xác định';
        console.error('updateOrder error:', err);
        this.notify.error('Cập nhật thất bại: ' + msg);
        this.isSaving = false;
      }
    });
  }

  delete() {
    if (!confirm(`Xóa đơn hàng ${this.orderId}?`)) return;
    this.isDeleting = true;
    this.orderService.deleteOrder(this.orderId).subscribe({
      next: () => {
        this.orderState.deleteOrder(this.orderId);
        this.notify.success('Đã xóa đơn hàng');
        this.isDeleting = false;
        this.router.navigate(['/admin/orders']);
      },
      error: (err: HttpErrorResponse) => {
        const msg = err?.error?.message || err?.message || 'Lỗi không xác định';
        console.error('deleteOrder error:', err);
        this.notify.error('Xóa thất bại: ' + msg);
        this.isDeleting = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/orders']);
  }

  // Kiểm tra step trong timeline đã qua chưa (bỏ qua cancelled)
  isStepDone(step: OrderStatus): boolean {
    const steps = this.statusTimeline;
    const curIdx  = steps.indexOf(this.order?.Status);
    const stepIdx = steps.indexOf(step);
    return stepIdx <= curIdx;
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  formatCurrency(val: number): string {
    if (!val && val !== 0) return '0đ';
    return val.toLocaleString('vi-VN') + 'đ';
  }
  onLogout() {
    this.auth.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }
}