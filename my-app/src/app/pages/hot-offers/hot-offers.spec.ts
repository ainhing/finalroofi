import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { Cartservice } from '../../services/cartservice';

@Component({
  selector: 'app-hot-offers',
  standalone: false,
  templateUrl: './hot-offers.html',
})
export class HotOffers {
  // Giỏ hàng
  cart: Array<any> = [];
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  showNotification: boolean = false;
  timeoutId: any;

  selectedSize: string = ''; // Biến lưu kích thước đã chọn cho mỗi sản phẩm

  // Các sản phẩm trong Deal of the Day
  dealOfTheDayProducts = [
    {
      id: 1,
      name: 'Áo Voan CreamWave',
      image: 'assets/images/hobo/hobo_aokieu/Hobo_Aokieu3/Hobo_Aokieu3.1.jpg',
      price: 560000,
      oldPrice: 720000,
      sizes: ['S', 'M', 'L', 'XL'],
      material: '100% Organic Cotton',
      liked: false
    },
    // Các sản phẩm khác...
  ];

  constructor(
    private cartService: Cartservice,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  // Thêm sản phẩm vào giỏ hàng
  addToCart(event: Event, product: any): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.selectedSize) {
      this.showToast('Vui lòng chọn kích thước!', 'error');
      return;
    }

    this.cartService.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: this.selectedSize // Thêm thông tin size
    });

    this.showToast(`Đã thêm nhanh: "${product.name}" với kích thước ${this.selectedSize}`, 'success');
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
      }, 3000); // Ẩn thông báo sau 3 giây
    });
  }

  closeToast(): void {
    this.showNotification = false;
    this.cdr.detectChanges();
  }
}
