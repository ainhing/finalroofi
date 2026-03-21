import { Component, EventEmitter, Input, Output, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import cả service và interface CartItem
import { Cartservice, CartItem } from '../../services/cartservice';  // ← kiểm tra path này
import { Notificationservice } from '../../services/notificationservice';

@Component({
  selector: 'app-quickview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quickview.html'
})
export class QuickView {

  @Input() product!: any;
  @Output() close = new EventEmitter<void>();

  selectedSize: string | null = null;

  // Toast notifications
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  timeoutId: any;

  constructor(
    private cartService: Cartservice,
    private notify: Notificationservice,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  selectSize(size: string) {
    this.selectedSize = size;
  }

  addToCart() {
    if (!this.selectedSize) {
      this.showToast('Vui lòng chọn size!', 'error');
      return;
    }

    // Tạo productId an toàn
    const productId = this.product.productId ||
                      this.product.id?.toString() ||
                      this.product._id ||
                      `temp-${Date.now()}`;

    const cartItem: CartItem = {
      productId,
      name: this.product.name,
      price: this.product.price,
      oldPrice: this.product.oldPrice,
      image: this.product.image,
      size: this.selectedSize,
      quantity: 1
    };

    this.cartService.add(cartItem);

    // Hiển thị thông báo thành công
    this.showToast(`Đã thêm: "${this.product.name}" (Size ${this.selectedSize})`, 'success');

    // Đóng quickview sau 1.5 giây
    setTimeout(() => {
      this.close.emit();
    }, 1500);
  }

  // Hiển thị thông báo toast
  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
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
}