import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartItem, Cartservice } from '../../services/cartservice';
import { Notificationservice } from '../../services/notificationservice';
import { ProvinceService } from '../../services/provinceservice';
import { Voucherservice } from '../../services/voucherservice';
import { Orderservice } from '../../services/orderservice';
import { Province, District, Ward } from '../../assets/data/province';

interface OrderData {
  customer: {
    name: string;
    phone: string;
    email: string;
    city: string;
    district: string;
    ward: string;
    address: string;
    note: string;
  };
  paymentMethod: string;
  voucherCode: string;
  items: Array<{
    productId: string;
    productName: string;
    size: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: string;
  orderCode?: string;
}

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
})
export class Cart implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  subtotal = 0;
  discount = 0;
  shipping = 0;
  total = 0;
  cartCount = 0;
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
    accountName: 'ROOFI CORP',
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
  showQRCode: boolean = false;
  qrTimer: any;

  // Voucher
  voucherCode: string = '';
  appliedVoucher: string = '';
  voucherMessage: string = '';
  voucherError: boolean = false;

  private cartSubscription?: Subscription;

  constructor(
    private cartService: Cartservice,
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
    
    // Subscribe to cart changes
    this.cartSubscription = this.cartService.getCart().subscribe(items => {
      console.log('🛒 Cart subscription triggered, items:', items.length);
      this.cartItems = items;
      console.log('🛒 Calling updateCartSummary() from subscription');
      this.updateCartSummary();
      this.checkEmptyCart();
    });

    // Load provinces
    this.loadProvinces();
  }

  ngOnDestroy() {
    // Cleanup cart subscription
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
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
  increaseQty(productId: string, size: string) {
    const item = this.cartItems.find(i => i.productId === productId && i.size === size);
    if (item) {
      // Update in service by adding 1 more
      this.cartService.add({ ...item, quantity: 1 });
      this.updateProductTotal(productId, size);
      this.updateCartSummary();
    }
  }

  decreaseQty(productId: string, size: string) {
  console.log('🔽 Decrease quantity called for:', productId, size);
  const item = this.cartItems.find(i => i.productId === productId && i.size === size);
  
  if (!item) {
    console.log('🔽 Item not found');
    return;
  }

  // ✅ THÊM: Nếu quantity = 1, hiện popup xác nhận xóa
  if (item.quantity === 1) {
    const productName = item.name;
    if (confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`)) {
      console.log('🔽 User confirmed removal');
      this.cartService.remove(productId, size);
      this.notify.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } else {
      console.log('🔽 User cancelled removal');
    }
  } else if (item.quantity > 1) {
    // Giảm bình thường nếu > 1
    console.log('🔽 Calling cartService.decrease()');
    this.cartService.decrease(productId, size);
  }
}

  onQuantityChange(productId: string, size: string, event: Event) {
    const input = event.target as HTMLInputElement;
    let quantity = parseInt(input.value);
    
    if (quantity < 1) {
      quantity = 1;
      input.value = '1';
    }

    const item = this.cartItems.find(i => i.productId === productId && i.size === size);
    if (item) {
      // Update quantity in service
      const diff = quantity - item.quantity;
      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          this.cartService.add({ ...item, quantity: 1 });
        }
      } else if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i++) {
          this.cartService.decrease(productId, size);
        }
      }
      this.updateProductTotal(productId, size);
      this.updateCartSummary();
    }
  }

  // ========================================
  // UPDATE PRODUCT TOTAL
  // ========================================
  updateProductTotal(productId: string, size: string) {
    // This will be handled by Angular's data binding
    // The total is calculated in getProductTotal()
  }

  getProductTotal(productId: string, size: string): number {
    const item = this.cartItems.find(i => i.productId === productId && i.size === size);
    if (item) {
      return item.price * item.quantity;
    }
    return 0;
  }

  // ========================================
  // UPDATE CART SUMMARY
  // ========================================
  updateCartSummary() {
    // Calculate subtotal
    this.subtotal = this.cartService.getTotalPrice();
    
    // Validate applied voucher when subtotal changes
    if (this.appliedVoucher) {
      const totalQuantity = this.cartService.getTotalQuantity();
      console.log('🔍 Validating voucher:', this.appliedVoucher, 'with subtotal:', this.subtotal, 'totalQuantity:', totalQuantity);
      const validation = this.voucherService.validateAppliedVoucher(this.subtotal, totalQuantity);
      if (validation.needsRemoval) {
        console.log('❌ Voucher needs removal:', validation.message);
        // Auto remove voucher if no longer valid
        this.removeVoucher();
        this.notify.error(validation.message || 'Voucher đã bị hủy do đơn hàng không còn đủ điều kiện');
        return; // Exit early since voucher was removed
      }
      console.log('✅ Voucher is still valid');
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
    
    // Cart count
    this.cartCount = this.cartService.getTotalQuantity();
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
  // DELETE PRODUCT
  // ========================================
  removeItem(productId: string, size: string) {
    const item = this.cartItems.find(i => i.productId === productId && i.size === size);
    if (!item) return;

    const productName = item.name;
    
    // Xác nhận xóa
    if (confirm(`Bạn có chắc muốn xóa "${productName}" khỏi giỏ hàng?`)) {
      this.cartService.remove(productId, size);
      this.updateCartSummary();
      this.checkEmptyCart();
      this.notify.success('Đã xóa sản phẩm khỏi giỏ hàng');
    }
  }

  // ========================================
  // CLEAR CART
  // ========================================
  clearCart() {
    if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      this.cartService.clear();
      this.updateCartSummary();
      this.checkEmptyCart();
      this.notify.success('Đã xóa toàn bộ giỏ hàng');
    }
  }

  // ========================================
  // CHECK EMPTY CART
  // ========================================
  checkEmptyCart() {
    this.isEmpty = this.cartItems.length === 0;
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

    const totalQuantity = this.cartService.getTotalQuantity();
    const result = this.voucherService.applyVoucher(this.voucherCode.toUpperCase(), this.subtotal, totalQuantity);
    
    if (result.valid) {
      // Auto replace existing voucher (simplest approach)
      this.appliedVoucher = this.voucherCode.toUpperCase();
      this.voucherError = false;
      this.voucherMessage = result.message;
      this.voucherService.saveAppliedVoucher(this.appliedVoucher);
      this.updateCartSummary();
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
    this.updateCartSummary();
    this.notify.success('Đã xóa voucher');
  }

  // ========================================
  // CHECKOUT FORM SUBMIT
  // ========================================
  onCheckoutSubmit(event: Event) {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const name    = formData.get('name') as string;
    const phone   = formData.get('phone') as string;
    const email   = formData.get('email') as string;
    const address = formData.get('address') as string;
    const note    = formData.get('note') as string;

    // ✅ Đọc city/district/ward từ ngModel, KHÔNG dùng formData.get()
    // vì formData đọc DOM native — browser tự hiển thị option đầu tiên
    // dù user chưa chọn → luôn ra "Xã Vĩnh Tường" hoặc tương tự
    const city     = this.selectedCity.trim();
    const district = this.selectedDistrict.trim();
    const ward     = this.selectedWard.trim();

    // Validate chỉ các field có dấu *
    const missingFields = [];
    
    if (!name || name.trim() === '') {
      missingFields.push('Họ và tên');
    }
    
    if (!phone || phone.trim() === '') {
      missingFields.push('Số điện thoại');
    }
    
    if (!email || email.trim() === '') {
      missingFields.push('Email');
    }
    
    if (!city || city.trim() === '') {
      missingFields.push('Tỉnh/Thành phố');
    }
    
    if (!district || district.trim() === '') {
      missingFields.push('Quận/Huyện');
    }
    
    if (!ward || ward.trim() === '') {
      missingFields.push('Phường/Xã');
    }
    
    if (!address || address.trim() === '') {
      missingFields.push('Địa chỉ cụ thể');
    }

    // Hiển thị lỗi rõ ràng nếu thiếu field bắt buộc
    if (missingFields.length > 0) {
      const errorMessage = `Vui lòng điền các thông tin bắt buộc: ${missingFields.join(', ')}`;
      this.notify.error(errorMessage);
      return;
    }

    // Validate phone
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      this.notify.error('Số điện thoại không hợp lệ!');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.notify.error('Email không hợp lệ!');
      return;
    }

    this.orderCode = this.generateOrderCode();

    // ✅ Payload đúng format backend (PascalCase, flat)
    const shippingAddress = `${address}, ${ward}, ${district}, ${city}`;

    const payload = {
      OrderId:         this.orderCode,
      Email:           email.trim(),
      FullName:        name.trim(),
      Phone:           phone.trim(),
      ShippingAddress: shippingAddress,
      Items: this.cartItems.map(item => ({
        ProductId:   item.productId,
        ProductName: item.name,
        Size:        item.size,
        Quantity:    item.quantity,
        Price:       item.price,
        Image:       item.image || '',
      })),
      SubTotal:      this.subtotal,
      Discount:      this.discount,
      ShippingFee:   this.shipping,
      TotalAmount:   this.total,
      PaymentMethod: this.selectedPaymentMethod,
      Note:          note || '',
    };

    if (this.selectedPaymentMethod === 'qr') {
      this.pendingOrderData = payload;
      this.showQrModal = true;
      this.startCountdown();
    } else {
      this.isPlacingOrder = true;
      this.orderService.createOrder(payload).subscribe({
        next: (savedOrder) => {
          // savedOrder đã là AppOrder (orderservice.normalize() rồi)
          this._onOrderSuccess(savedOrder);
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
  _onOrderSuccess(savedOrder?: any) {
    if (savedOrder) {
      localStorage.setItem('lastOrder', JSON.stringify(savedOrder));
    }
    this.notify.success('Đặt hàng thành công!');
    if (this.appliedVoucher) {
      this.voucherService.consumeVoucher(this.appliedVoucher);
      this.appliedVoucher = '';
      this.voucherCode = '';
      this.voucherService.removeAppliedVoucher();
      this.updateCartSummary();
    }
    this.cartService.clear();
    setTimeout(() => this.router.navigate(['/order-confirm']), 100);
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
            next: (savedOrder) => {
              this._onOrderSuccess(savedOrder);
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
      }
    }, 1000);
  }

  closeQrModal() {
    this.showQrModal = false;
    this.showQRCode = false; // Reset legacy QR display
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    // Clear legacy QR timer
    if (this.qrTimer) {
      clearTimeout(this.qrTimer);
    }
    // Reset payment method to COD when closing QR modal
    this.selectedPaymentMethod = 'cod';
    
    // Reset pending order data
    this.pendingOrderData = null;
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
      // Reset if "Chọn" option selected
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
      // Reset if "Chọn" option selected
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