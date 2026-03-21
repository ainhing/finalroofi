import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Orderservice } from '../../services/orderservice';

import { Authservice } from '../../services/authservice';
import { AppOrder } from '../../services/orderstateservice';

@Component({
  selector: 'app-order-history',
  standalone: false,
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistory implements OnInit {
  orders: AppOrder[]       = [];
  selectedOrder: AppOrder | null = null;
  isLoading = false;

  constructor(
    private orderService: Orderservice,
    private authService: Authservice,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    const user    = this.authService.getCurrentUser();
    // Lọc đơn hàng theo email của user đang đăng nhập
    const filters = user?.email ? { email: user.email } : undefined;
    this.orderService.getOrders(true, filters).subscribe({
      next: orders => {
        this.orders    = orders;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading orders:', err);
        this.isLoading = false;
      }
    });
  }

  goBack() { this.location.back(); }

  selectOrder(order: AppOrder) {
    this.selectedOrder = this.selectedOrder?.OrderId === order.OrderId ? null : order;
  }

  // ========================================
  // DATE HELPERS
  // ========================================
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  getDeliveryDate(order: AppOrder): string {
    const d = new Date(order.CreatedAt);
    d.setDate(d.getDate() + 3);
    return this.formatDate(d.toISOString());
  }

  // ========================================
  // STATUS HELPERS
  // ========================================
  getOrderStatus(order: AppOrder): string {
    // Ưu tiên status từ backend nếu không phải pending
    if (order.Status && order.Status !== 'pending') return order.Status;

    const days = Math.floor(
      (Date.now() - new Date(order.CreatedAt).getTime()) / 86400000
    );
    if (days < 1)  return 'pending';
    if (days < 3)  return 'shipping';
    return 'delivered';
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'pending':   return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping':  return 'Đang giao hàng';
      case 'delivered': return 'Đã giao thành công';
      case 'cancelled': return 'Đã hủy';
      default:          return 'Chờ xác nhận';
    }
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'pending':   return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipping':  return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  }

  // ========================================
  // ACTIONS
  // ========================================
  viewOrderDetail(order: AppOrder) {
    localStorage.setItem('lastOrder', JSON.stringify(order));
    this.router.navigate(['/order-confirm']);
  }

  downloadInvoice(order: AppOrder) {
    const content = this.generateInvoiceContent(order);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const el   = document.createElement('a');
    el.href    = url;
    el.download = `invoice_${order.OrderId}.txt`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
    URL.revokeObjectURL(url);
  }

  private generateInvoiceContent(order: AppOrder): string {
    const lines: string[] = [];
    const status          = this.getStatusLabel(this.getOrderStatus(order));
    const delivery        = this.getDeliveryDate(order);

    lines.push('═══════════════════════════════════════');
    lines.push('         HÓA ĐƠN MUA HÀNG              ');
    lines.push('═══════════════════════════════════════');
    lines.push('');
    lines.push(`Mã đơn hàng:       ${order.OrderId}`);
    lines.push(`Ngày đặt hàng:     ${this.formatDate(order.CreatedAt)}`);
    lines.push(`Ngày giao dự kiến: ${delivery}`);
    lines.push(`Trạng thái:        ${status}`);
    lines.push('');
    lines.push('───────────────────────────────────────');
    lines.push('         THÔNG TIN KHÁCH HÀNG          ');
    lines.push('───────────────────────────────────────');
    lines.push(`Họ và tên: ${order.FullName}`);
    lines.push(`Email:     ${order.Email}`);
    lines.push(`SĐT:       ${order.Phone}`);
    lines.push(`Địa chỉ:   ${order.ShippingAddress}`);
    if (order.Note) lines.push(`Ghi chú:   ${order.Note}`);
    lines.push('');
    lines.push('───────────────────────────────────────');
    lines.push('           CHI TIẾT ĐƠN HÀNG          ');
    lines.push('───────────────────────────────────────');

    order.Items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.ProductName}`);
      lines.push(`   Size: ${item.Size || '-'} | Số lượng: ${item.Quantity}`);
      lines.push(`   Đơn giá: ${item.Price.toLocaleString('vi-VN')}đ`);
      lines.push(`   Thành tiền: ${(item.Price * item.Quantity).toLocaleString('vi-VN')}đ`);
      lines.push('');
    });

    lines.push('───────────────────────────────────────');
    lines.push('              TỔNG CỘNG                ');
    lines.push('───────────────────────────────────────');
    lines.push(`Tạm tính:        ${order.SubTotal.toLocaleString('vi-VN')}đ`);
    if (order.Discount > 0)
      lines.push(`Giảm giá:       -${order.Discount.toLocaleString('vi-VN')}đ`);
    lines.push(`Phí vận chuyển:  ${order.ShippingFee.toLocaleString('vi-VN')}đ`);
    lines.push(`TỔNG CỘNG:       ${order.TotalAmount.toLocaleString('vi-VN')}đ`);
    lines.push('');
    lines.push('═══════════════════════════════════════');
    lines.push('  Cảm ơn bạn đã mua sắm tại ROOFI!    ');
    lines.push('═══════════════════════════════════════');

    return lines.join('\n');
  }
}