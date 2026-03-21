import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BuyNowItem, Buynowservice } from '../../services/buynowservice';
import { Notificationservice } from '../../services/notificationservice';
import { ProvinceService } from '../../services/provinceservice';
import { Voucherservice } from '../../services/voucherservice';
import { Orderservice } from '../../services/orderservice';
import { Province, District, Ward } from '../../assets/data/province';

@Component({
  selector: 'app-buynowcheckout',
  standalone: false,
  templateUrl: './buynowcheckout.html',
  styleUrl: './buynowcheckout.css',
})
export class Buynowcheckout implements OnInit, OnDestroy {
  buyNowItem: BuyNowItem | null = null;
  subtotal = 0;
  discount = 0;
  shipping = 0;
  total = 0;
  isEmpty = false;

  // Province data
  provinces: Province[] = [];
  districts: District[] = [];
  wards: Ward[] = [];
  selectedCity: string = '';
  selectedDistrict: string = '';
  selectedWard: string = '';
  selectedCityCode: number | null = null;
  selectedDistrictCode: number | null = null;
  
  // Loading states
  loadingProvinces = false;
  loadingDistricts = false;
  loadingWards = false;

  isPlacingOrder = false;

  // Payment methods
  paymentMethods = [
    { id: 'cod', name: 'COD (Thanh toán khi nhận hàng)', description: 'Thanh toán bằng tiền mặt khi nhận sản phẩm' },
    { id: 'qr', name: 'QR Code', description: 'Quét mã QR để thanh toán' }
  ];
  selectedPaymentMethod: string = 'cod';

  // QR Code data
  qrCodeUrl: string = '../assets/images/qrcode/qrcode.jpg';
  bankInfo = {
    accountName: 'ROOFI CORP', // Changed from 'NGUYEN VAN A'
    accountNumber: '123456789',
    bankName: 'Vietcombank',
    amount: 0
  };

  // QR Modal state
  showQrModal: boolean = false;
  orderCode: string = '';
  countdown: number = 120; // 2 minutes in seconds
  countdownInterval: any;
  pendingOrderData: any = null; // Lưu order data tạm cho QR

  // QR Timer (legacy - keep for compatibility)
  showQRCode: boolean = false; // Kept for compatibility, but its usage will be removed
  qrTimer: any; // Kept for compatibility, but its usage will be removed

  // Voucher
  voucherCode: string = '';
  appliedVoucher: string = '';
  voucherMessage: string = '';
  voucherError: boolean = false;

  // Form data
  customerName: string = '';
  customerPhone: string = '';
  customerEmail: string = '';
  customerAddress: string = '';
  customerNote: string = '';

  private buyNowSubscription?: Subscription;

  constructor(
    private buyNowService: Buynowservice,
    private notify: Notificationservice,
    private router: Router,
    private provinceService: ProvinceService,
    private voucherService: Voucherservice,
    private orderService: Orderservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Load applied voucher from localStorage
    this.appliedVoucher = this.voucherService.getAppliedVoucher();
    
    // Subscribe to buy now item changes
    this.buyNowSubscription = this.buyNowService.getBuyNowItem().subscribe(item => {
      this.buyNowItem = item;
      this.updateSummary();
      this.checkEmpty();
    });

    // Load provinces
    this.loadProvinces();
  }

  ngOnDestroy() {
    // Cleanup buy now subscription
    if (this.buyNowSubscription) {
      this.buyNowSubscription.unsubscribe();
    }
    
    // Cleanup QR timer
    if (this.qrTimer) {
      clearTimeout(this.qrTimer);
    }

    // Cleanup countdown interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // ========================================
  // QUANTITY BUTTONS
  // ========================================
  increaseQty() {
    if (this.buyNowItem) {
      this.buyNowItem.quantity++;
      this.updateSummary();
    }
  }

  decreaseQty() {
  if (!this.buyNowItem) {
    return;
  }

  // Nếu quantity = 1, hiện popup xác nhận xóa
  if (this.buyNowItem.quantity === 1) {
    const productName = this.buyNowItem.name;
    if (confirm(`Bạn có chắc muốn xóa "${productName}"?`)) {
      this.buyNowService.clear();
      this.updateSummary();
      this.checkEmpty();
      this.notify.success('Đã xóa sản phẩm');
      this.router.navigate(['/product']);
    }
  } else if (this.buyNowItem.quantity > 1) {
    // Giảm bình thường nếu > 1
    this.buyNowItem.quantity--;
    this.updateSummary();
  }
}

  onQuantityChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let quantity = parseInt(input.value);
    
    if (quantity < 1) {
      quantity = 1;
      input.value = '1';
    }

    if (this.buyNowItem) {
      this.buyNowItem.quantity = quantity;
      this.updateSummary();
    }
  }

  // ========================================
  // UPDATE SUMMARY
  // ========================================
  updateSummary() {
    if (this.buyNowItem) {
      this.subtotal = this.buyNowItem.price * this.buyNowItem.quantity;
      
      // Validate applied voucher when subtotal changes
      if (this.appliedVoucher) {
        const totalQuantity = this.buyNowItem ? this.buyNowItem.quantity : 0;
        const validation = this.voucherService.validateAppliedVoucher(this.subtotal, totalQuantity);
        if (validation.needsRemoval) {
          // Auto remove voucher if no longer valid
          this.removeVoucher();
          this.notify.error(validation.message || 'Voucher đã bị hủy do đơn hàng không còn đủ điều kiện');
          return; // Exit early since voucher was removed
        }
      }
      
      // Calculate discount from voucher
      this.discount = 0;
      if (this.appliedVoucher) {
        const result = this.voucherService.applyVoucher(this.appliedVoucher, this.subtotal);
        if (result.valid) {
          this.discount = result.discount;
        }
      }
      
      // Shipping (miễn phí nếu > 500k hoặc có freeship)
      const hasFreeShipVoucher = this.appliedVoucher === 'FREESHIP';
      this.shipping = (this.subtotal > 500000 || hasFreeShipVoucher) ? 0 : 30000;
      
      // Total
      this.total = this.subtotal - this.discount + this.shipping;
      
      // Update QR amount
      this.bankInfo.amount = this.total;
    } else {
      this.subtotal = 0;
      this.discount = 0;
      this.shipping = 0;
      this.total = 0;
    }
  }

  // ========================================
  // FORMAT PRICE
  // ========================================
  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + 'đ';
  }

  getShippingText(): string {
    return this.shipping === 0 ? 'Miễn phí' : this.formatPrice(this.shipping);
  }

  // ========================================
  // REMOVE ITEM
  // ========================================
  removeItem() {
    if (this.buyNowItem && confirm(`Bạn có chắc muốn xóa "${this.buyNowItem.name}"?`)) {
      this.buyNowService.clear();
      this.updateSummary();
      this.checkEmpty();
      this.notify.success('Đã xóa sản phẩm');
      this.router.navigate(['/product']);
    }
  }

  // ========================================
  // CHECK EMPTY
  // ========================================
  checkEmpty() {
    this.isEmpty = !this.buyNowItem;
  }

  // ========================================
  // VOUCHER METHODS
  // ========================================
  applyVoucher() {
    if (!this.voucherCode.trim()) {
      this.voucherError = true;
      this.voucherMessage = 'Vui lòng nhập mã voucher!';
      return;
    }

    const totalQuantity = this.buyNowItem ? this.buyNowItem.quantity : 0;
    const result = this.voucherService.applyVoucher(this.voucherCode.toUpperCase(), this.subtotal, totalQuantity);
    
    if (result.valid) {
      // Auto replace existing voucher (simplest approach)
      this.appliedVoucher = this.voucherCode.toUpperCase();
      this.voucherError = false;
      this.voucherMessage = result.message;
      this.voucherService.saveAppliedVoucher(this.appliedVoucher);
      this.updateSummary();
      this.notify.success(result.message);
    } else {
      this.voucherError = true;
      this.voucherMessage = result.message;
      this.notify.error(result.message);
    }
  }

  removeVoucher() {
    this.appliedVoucher = '';
    this.voucherCode = '';
    this.voucherMessage = '';
    this.voucherError = false;
    this.voucherService.removeAppliedVoucher();
    this.updateSummary();
    this.notify.success('Đã xóa voucher');
  }

  // ========================================
  // CHECKOUT FORM SUBMIT
  // ========================================
  onCheckoutSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.buyNowItem) {
      this.notify.error('Không có sản phẩm để đặt hàng!');
      return;
    }

    // Validate form
    if (!this.customerName.trim()) {
      this.notify.error('Vui lòng nhập họ tên!');
      return;
    }

    if (!this.customerPhone.trim()) {
      this.notify.error('Vui lòng nhập số điện thoại!');
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(this.customerPhone)) {
      this.notify.error('Số điện thoại không hợp lệ!');
      return;
    }

    if (!this.customerEmail.trim()) {
      this.notify.error('Vui lòng nhập email!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.customerEmail)) {
      this.notify.error('Email không hợp lệ!');
      return;
    }

    if (!this.selectedCity) {
      this.notify.error('Vui lòng chọn tỉnh/thành phố!');
      return;
    }

    if (!this.selectedDistrict) {
      this.notify.error('Vui lòng chọn quận/huyện!');
      return;
    }

    if (!this.selectedWard) {
      this.notify.error('Vui lòng chọn phường/xã!');
      return;
    }

    if (!this.customerAddress.trim()) {
      this.notify.error('Vui lòng nhập địa chỉ!');
      return;
    }

    this.orderCode = this.generateOrderCode();

    // ✅ Payload đúng format backend (PascalCase, flat)
    const shippingAddress = `${this.customerAddress}, ${this.selectedWard}, ${this.selectedDistrict}, ${this.selectedCity}`;

    const payload = {
      OrderId:         this.orderCode,
      Email:           this.customerEmail.trim(),
      FullName:        this.customerName.trim(),
      Phone:           this.customerPhone.trim(),
      ShippingAddress: shippingAddress,
      Items: [{
        ProductId:   this.buyNowItem.productId,
        ProductName: this.buyNowItem.name,
        Size:        this.buyNowItem.size,
        Quantity:    this.buyNowItem.quantity,
        Price:       this.buyNowItem.price,
        Image:       this.buyNowItem.image || '',
      }],
      SubTotal:      this.subtotal,
      Discount:      this.discount,
      ShippingFee:   this.shipping,
      TotalAmount:   this.total,
      PaymentMethod: this.selectedPaymentMethod,
      Note:          this.customerNote || '',
    };

    if (this.selectedPaymentMethod === 'qr') {
      this.pendingOrderData = payload;
      this.showQrModal = true;
      this.startCountdown();
    } else {
      this.isPlacingOrder = true;
      this.orderService.createOrder(payload).subscribe({
        next: () => {
          this._onOrderSuccess();
        },
        error: (err: HttpErrorResponse) => {
          const msg = err?.error?.message || err?.message || 'Lỗi không xác định';
          this.notify.error('Đặt hàng thất bại: ' + msg);
          this.isPlacingOrder = false;
        }
      });
    }
  }

  // ========================================
  // QR MODAL METHODS
  // ========================================
  _onOrderSuccess() {
    this.notify.success('Đặt hàng thành công!');
    if (this.appliedVoucher) {
      this.voucherService.consumeVoucher(this.appliedVoucher);
      this.appliedVoucher = '';
      this.voucherCode = '';
      this.voucherService.removeAppliedVoucher();
      this.updateSummary();
    }
    this.buyNowService.clear();
    this.router.navigate(['/order-confirm']);
  }

    generateOrderCode(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `RF${timestamp.toString().slice(-6)}${random}`;
  }

  formatCountdown(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  startCountdown() {
    this.countdown = 120; // Reset to 2 minutes
    
    // Clear existing interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      
      // Force UI update every second
      this.cdr.detectChanges();
      
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        
        // Lưu order khi hết thời gian
        if (this.pendingOrderData) {
          this.isPlacingOrder = true;
          this.orderService.createOrder(this.pendingOrderData).subscribe({
            next: () => {
              this._onOrderSuccess();
              this.isPlacingOrder = false;
            },
            error: (err: HttpErrorResponse) => {
              const msg = err?.error?.message || err?.message || 'Lỗi không xác định';
              this.notify.error('Đặt hàng thất bại: ' + msg);
              this.isPlacingOrder = false;
            }
          });
          this.pendingOrderData = null;
        }
        
        this.closeQrModal();
        this.router.navigate(['/order-confirm']);
      }
    }, 1000);
  }

  closeQrModal() {
    this.showQrModal = false;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    // Reset pending order data
    this.pendingOrderData = null;
  }

  // ========================================
  // QR TIMER METHODS (LEGACY)
  // ========================================
  startQRTimer() {
    // Xóa timer cũ nếu có
    if (this.qrTimer) {
      clearTimeout(this.qrTimer);
    }

    // Tạo timer 2 phút
    this.qrTimer = setTimeout(() => {
      this.showQRCode = false;
      this.notify.info('Mã QR đã hết hạn. Vui lòng đặt hàng lại.');
    }, 2 * 60 * 1000); // 2 phút
  }

  // ========================================
  // PROVINCE API HANDLERS
  // ========================================
  
  loadProvinces() {
    this.loadingProvinces = true;
    this.provinceService.getProvinces().subscribe({
      next: (provinces) => {
        this.provinces = provinces;
        this.loadingProvinces = false;
      },
      error: (error) => {
        console.error('Error loading provinces:', error);
        this.notify.error('Không thể tải danh sách tỉnh/thành phố. Vui lòng thử lại!');
        this.loadingProvinces = false;
      }
    });
  }

  onCityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedOption = select.options[select.selectedIndex];
    const cityCode = parseInt(selectedOption.getAttribute('data-code') || '0');
    const cityName = select.value;

    if (!cityCode || cityCode === 0) {
      this.selectedCity = '';
      this.selectedCityCode = null;
      this.districts = [];
      this.wards = [];
      this.selectedDistrict = '';
      this.selectedWard = '';
      this.selectedDistrictCode = null;
      return;
    }

    this.selectedCity = cityName;
    this.selectedCityCode = cityCode;
    
    // Reset district and ward
    this.districts = [];
    this.wards = [];
    this.selectedDistrict = '';
    this.selectedWard = '';
    this.selectedDistrictCode = null;

    // Load districts
    this.loadDistricts(cityCode);
  }

  loadDistricts(provinceCode: number) {
    this.loadingDistricts = true;
    this.provinceService.getDistricts(provinceCode).subscribe({
      next: (districts) => {
        this.districts = districts;
        this.loadingDistricts = false;
      },
      error: (error) => {
        console.error('Error loading districts:', error);
        this.notify.error('Không thể tải danh sách quận/huyện. Vui lòng thử lại!');
        this.loadingDistricts = false;
      }
    });
  }

  onDistrictChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedOption = select.options[select.selectedIndex];
    const districtCode = parseInt(selectedOption.getAttribute('data-code') || '0');
    const districtName = select.value;

    if (!districtCode || districtCode === 0) {
      this.selectedDistrict = '';
      this.selectedDistrictCode = null;
      this.wards = [];
      this.selectedWard = '';
      return;
    }

    this.selectedDistrict = districtName;
    this.selectedDistrictCode = districtCode;
    
    // Reset ward
    this.wards = [];
    this.selectedWard = '';

    // Load wards
    this.loadWards(districtCode);
  }

  loadWards(districtCode: number) {
    this.loadingWards = true;
    this.provinceService.getWards(districtCode).subscribe({
      next: (wards) => {
        this.wards = wards;
        this.loadingWards = false;
      },
      error: (error) => {
        console.error('Error loading wards:', error);
        this.notify.error('Không thể tải danh sách phường/xã. Vui lòng thử lại!');
        this.loadingWards = false;
      }
    });
  }

  onWardChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedWard = select.value;
  }
}