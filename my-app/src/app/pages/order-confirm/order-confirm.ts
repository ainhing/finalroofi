import { Component, OnInit, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Cartservice } from '../../services/cartservice';
import { Notificationservice } from '../../services/notificationservice';
import { AppOrder } from '../../services/orderstateservice';


@Component({
  selector: 'app-order-confirm',
  standalone: false,
  templateUrl: './order-confirm.html',
  styleUrls: ['./order-confirm.css']
})
export class OrderConfirm implements OnInit, AfterViewInit {
  orderData: AppOrder | null = null;
  orderId        = '';
  customerName   = '';
  customerPhone  = '';
  customerEmail  = '';
  customerAddress = '';
  orderTotal     = '';
  isProcessing   = false;
  showCheckmark  = false;
  expectedDeliveryDate = '';

  // Toast notification
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  showNotification = false;
  timeoutId: any;

  constructor(
    private cartService: Cartservice,
    private notify: Notificationservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadOrderData();
    this.computeExpectedDeliveryDate();

    setTimeout(() => this.animateSuccessCheckmark(), 300);
    setTimeout(() => this.launchConfetti(), 500);

    if (this.orderData && this.isJustCreated()) {
      this.sendEmailNotification(this.orderData);
      this.clearCart();
    }
  }

  ngAfterViewInit() {}

  // ========================================
  // LOAD ORDER DATA FROM LOCALSTORAGE
  // ========================================
  loadOrderData(): AppOrder | null {
    const raw = localStorage.getItem('lastOrder');
    if (!raw) {
      console.warn('No order data found');
      this.router.navigate(['/cart']);
      return null;
    }

    try {
      const order = JSON.parse(raw) as AppOrder;
      this.orderData = order;

      // Map flat PascalCase fields → component properties
      this.orderId         = order.OrderId  || '';
      this.customerName    = order.FullName  || '';
      this.customerPhone   = order.Phone     || '';
      this.customerEmail   = order.Email     || '';
      this.customerAddress = order.ShippingAddress || '';
      this.orderTotal      = this.formatPrice(order.TotalAmount || 0);

      return order;
    } catch (err) {
      console.error('Error parsing order data:', err);
      this.notify.error('Không thể tải thông tin đơn hàng');
      return null;
    }
  }

  // ========================================
  // ORDER STATUS (dựa theo CreatedAt)
  // ========================================
  isJustCreated(): boolean {
    if (!this.orderData?.CreatedAt) return false;
    const secs = (Date.now() - new Date(this.orderData.CreatedAt).getTime()) / 1000;
    return secs < 10;
  }

  getOrderStatus(): string {
    if (!this.orderData?.CreatedAt) return 'pending';
    if (this.isJustCreated()) return 'just-created';

    // Ưu tiên Status từ backend nếu có
    const backendStatus = this.orderData.Status;
    if (backendStatus && backendStatus !== 'pending') return backendStatus;

    const days = Math.floor(
      (Date.now() - new Date(this.orderData.CreatedAt).getTime()) / 86400000
    );
    if (days < 1)  return 'pending';
    if (days < 3)  return 'shipping';
    return 'delivered';
  }

  getStatusLabel(): string {
    switch (this.getOrderStatus()) {
      case 'just-created': return 'Đặt hàng thành công';
      case 'pending':      return 'Chờ xác nhận';
      case 'confirmed':    return 'Đã xác nhận';
      case 'shipping':     return 'Đang giao hàng';
      case 'delivered':    return 'Đã giao thành công';
      case 'cancelled':    return 'Đã hủy';
      default:             return 'Chờ xác nhận';
    }
  }

  getStatusBadgeClass(): string {
    switch (this.getOrderStatus()) {
      case 'just-created': return 'bg-green-100 text-green-800';
      case 'pending':      return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':    return 'bg-blue-100 text-blue-800';
      case 'shipping':     return 'bg-purple-100 text-purple-800';
      case 'delivered':    return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':    return 'bg-red-100 text-red-800';
      default:             return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusMessage(): string {
    switch (this.getOrderStatus()) {
      case 'just-created':
        return 'Cảm ơn bạn đã tin tưởng ROOFI! 🌿<br>Đơn hàng của bạn đã được ghi nhận và đang chờ xác nhận.';
      case 'pending':
        return 'Đơn hàng của bạn đang chờ được xác nhận.<br>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất!';
      case 'confirmed':
        return 'Đơn hàng đã được xác nhận! ✅<br>Chúng tôi đang chuẩn bị hàng cho bạn.';
      case 'shipping':
        return 'Đơn hàng của bạn đang được vận chuyển! 🚚<br>Hàng sẽ được giao đến bạn trong thời gian sớm nhất.';
      case 'delivered':
        return 'Đơn hàng đã được giao thành công! ✅<br>Cảm ơn bạn đã mua hàng tại ROOFI. Hẹn gặp lại!';
      case 'cancelled':
        return 'Đơn hàng đã bị hủy.<br>Vui lòng liên hệ hotline nếu cần hỗ trợ.';
      default:
        return 'Đơn hàng của bạn đang được xử lý.';
    }
  }

  // ========================================
  // EXPECTED DELIVERY DATE
  // ========================================
  private computeExpectedDeliveryDate(): void {
    const base = this.orderData?.CreatedAt ? new Date(this.orderData.CreatedAt) : new Date();
    const expected = new Date(base);
    expected.setDate(expected.getDate() + 3);
    this.expectedDeliveryDate = this.formatDateOnly(expected);
  }

  private formatDateOnly(date: Date): string {
    try {
      return date.toLocaleDateString('vi-VN');
    } catch {
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
  }

  // ========================================
  // FORMAT PRICE
  // ========================================
  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + 'đ';
  }

  // ========================================
  // CLEAR CART
  // ========================================
  clearCart() {
    this.cartService.clear();
  }

  // ========================================
  // ANIMATIONS
  // ========================================
  animateSuccessCheckmark() {
    this.showCheckmark = true;
    setTimeout(() => {
      document.querySelector('.checkmark-container')?.classList.add('animate-checkmark');
    }, 100);
  }

  launchConfetti() {
    const colors = ['#2E7D32', '#F5F5DC', '#8D6E63'];
    for (let i = 0; i < 50; i++) {
      setTimeout(() => this.createConfetti(colors[Math.floor(Math.random() * colors.length)]), i * 30);
    }
  }

  createConfetti(color: string) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `position:fixed;width:10px;height:10px;background-color:${color};left:${Math.random()*100}%;top:-10px;z-index:9999;pointer-events:none;animation:confetti-fall ${Math.random()*3+2}s linear forwards;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }

  // ========================================
  // EMAIL NOTIFICATION (DEMO)
  // ========================================
  sendEmailNotification(order: AppOrder) {
    console.log('📧 Sending email to:', order.Email);
    this.notify.info('Đã gửi email xác nhận đơn hàng đến ' + order.Email);
  }

  // ========================================
  // PRODUCT QUICK-ADD TO CART
  // ========================================
  addToCart(event: Event, product: any): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.add({
      productId: product.id,
      name:      product.name,
      price:     product.price,
      quantity:  1,
      image:     product.image,
      size:      'S'
    });
    this.showToast(`Đã thêm nhanh: "${product.name}"`, 'success');
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.notificationMessage = message;
    this.notificationType    = type;
    this.showNotification    = true;
    this.cdr.detectChanges();
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.showNotification = false;
          this.cdr.detectChanges();
        });
      }, 3000);
    });
  }

  closeToast(): void {
    this.showNotification = false;
    this.cdr.detectChanges();
  }

  printOrder() { window.print(); }

  viewOrderHistory() {
    this.router.navigate(['/order-history']);
  }

  downloadOrderPDF() {
    this.notify.info('Chức năng tải PDF đang được phát triển!');
  }
}