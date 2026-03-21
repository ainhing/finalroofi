import { Component, HostListener, ChangeDetectorRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Newsletterservice } from '../../services/newsletterservice';
import { Notificationservice } from '../../services/notificationservice';
import { Cartservice } from '../../services/cartservice';
import { Wishlistservice } from '../../services/wishlistservice';
import { Subscription } from 'rxjs';
import { Authservice } from '../../services/authservice';
import { Productservice } from '../../services/productservice';
import { ProductStateService } from '../../services/product-state.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  currentSlide = 0;
  intervalId: any;
  newsletterEmail = '';
  isSubmitting = false;

  // Toast notifications
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  timeoutId: any;
  private wishlistSub?: Subscription;
  private productSub?: Subscription;

  constructor(
    private newsletterService: Newsletterservice,
    private notify: Notificationservice,
    private cartService: Cartservice,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private wishlistService: Wishlistservice,
    private authService: Authservice,
    private router: Router,
    private productService: Productservice,
    private stateService: ProductStateService
  ) {}

  ngOnInit(): void {
    this.wishlistService.syncFromStorage();

    // Keep heart states synced instantly
    this.wishlistSub = this.wishlistService.wishlistChanges$.subscribe(ids => {
      this.applyWishlistState(ids);
      this.cdr.detectChanges();
    });

    // Listen for product updates from admin (real-time)
    this.productSub = this.stateService.products$.subscribe(sections => {
      this.updateHotProductsFromServer(sections);
      this.applyWishlistState(this.wishlistService.getWishlist());
      this.cdr.detectChanges();
    });

    // Load products from API to trigger state update
    this.productService.getProducts().subscribe(() => {
      this.applyWishlistState(this.wishlistService.getWishlist());
      this.cdr.detectChanges();
    });

    this.startAutoSlide();
  }

  private applyWishlistState(ids: string[]): void {
    const liked = new Set(ids.map(id => id.toString()));
    this.hotProducts = this.hotProducts.map(p => ({ ...p, liked: liked.has(p.id.toString()) }));
  }

  /**
   * FIX: Cập nhật hotProducts từ server, ưu tiên sản phẩm có IsFeatured = true
   */
  private updateHotProductsFromServer(sections: any[]): void {
    if (!sections || sections.length === 0) return;

    const allProducts: any[] = [];
    sections.forEach(section => {
      if (section.products && Array.isArray(section.products)) {
        allProducts.push(...section.products);
      }
    });

    // Lọc sản phẩm nổi bật (IsFeatured hoặc isFeatured)
    const featured = allProducts.filter(
      (p: any) => p.IsFeatured === true || p.isFeatured === true
    );

    // Nếu có sản phẩm nổi bật thì dùng, nếu không fallback về 5 sản phẩm đầu
    const source = featured.length > 0 ? featured : allProducts;

    this.hotProducts = source.slice(0, 5).map((p: any) => ({
      id: p.id || p.ProductId,
      name: p.name || p.ProductName,
      image: p.image || (Array.isArray(p.Images) && p.Images[0]) || '',
      price: p.price || p.Price,
      oldPrice: p.originalPrice || p.OriginalPrice,
      sizes: ['S', 'M', 'L', 'XL'],
      material: p.material || p.Material || '100% Organic Cotton',
      liked: false
    }));
  }

  // Thêm mảng sản phẩm hot (dùng để truyền vào QuickView)
  hotProducts = [
    {
      id: 'hobo-ao-1',
      name: 'Áo Voan Thêu Hoa EcoSoft',
      image: 'assets/images/hobo/hobo_aokieu/Hobo_Aokieu1/Hobo_Aokieu1.1.jpg',
      price: 560000,
      oldPrice: 720000,
      sizes: ['S', 'M', 'L', 'XL'],
      material: '100% Organic Cotton',
      liked: false
    },
    {
      id: 'hobo-ao-2',
      name: 'Áo Ren EcoLace Satin',
      image: 'assets/images/hobo/hobo_aokieu/Hobo_Aokieu2/Hobo_Aokieu2.1.jpg',
      price: 520000,
      oldPrice: 650000,
      sizes: ['S', 'M', 'L'],
      material: '100% Organic Cotton',
      liked: false
    },
    {
      id: 'hobo-ao-3',
      name: 'Áo Voan Hoa ReBloom',
      image: 'assets/images/hobo/hobo_aokieu/Hobo_Aokieu3/Hobo_Aokieu3.1.jpg',
      price: 480000,
      oldPrice: 650000,
      sizes: ['M', 'L', 'XL'],
      material: '100% Organic Cotton',
      liked: false
    },
    {
      id: 'hobo-ao-4',
      name: 'Áo Tay Phồng Voan Airy',
      image: 'assets/images/hobo/hobo_aokieu/Hobo_Aokieu4/Hobo_Aokieu4.1.jpg',
      price: 590000,
      oldPrice: 600000,
      sizes: ['S', 'M', 'L'],
      material: '100% Organic Cotton',
      liked: false
    },
    {
      id: 'hobo-ao-5',
      name: 'Áo Voan Tầng CreamWave',
      image: 'assets/images/hobo/hobo_aokieu/Hobo_Aokieu5/Hobo_Aokieu5.1.jpg',
      price: 620000,
      oldPrice: 720000,
      sizes: ['S', 'M', 'L', 'XL'],
      material: '100% Organic Cotton',
      liked: false
    }
  ];

  selectedProduct: any = null;

  ngOnDestroy() {
    clearInterval(this.intervalId);
    this.wishlistSub?.unsubscribe();
    this.productSub?.unsubscribe();
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 4000);
  }

  nextSlide() {
    const container = document.getElementById('slider-container');
    if (!container) return;
    this.currentSlide = (this.currentSlide + 1) % 6;
    container.style.transform = `translateX(-${this.currentSlide * 100}%)`;
  }

  prevSlide() {
    const container = document.getElementById('slider-container');
    if (!container) return;
    this.currentSlide = (this.currentSlide - 1 + 6) % 6;
    container.style.transform = `translateX(-${this.currentSlide * 100}%)`;
  }

  // Hàm mở QuickView
  openQuickView(product: any) {
    this.selectedProduct = product;
  }

  // Hàm đóng (gọi từ QuickView qua Output)
  closeQuickView() {
    this.selectedProduct = null;
  }

  // Toggle wishlist
  toggleLike(event: Event, product: any): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.authService.isLoggedIn()) {
      this.notify.error('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích.');
      this.router.navigate(['/login']);
      return;
    }

    const nowLiked = this.wishlistService.toggle(product.id.toString());
    product.liked = nowLiked;
    this.showToast(
      nowLiked ? `Đã thêm "${product.name}" vào yêu thích` : `Đã xóa "${product.name}" khỏi yêu thích`,
      'success'
    );
  }

  // Thêm sản phẩm vào giỏ hàng
  addToCart(event: Event, product: any): void {
    event.stopPropagation();
    event.preventDefault();

    this.cartService.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: 'S'
    });

    this.showToast(`Đã thêm nhanh: "${product.name}"`, 'success');
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

  // Newsletter subscription
  onNewsletterSubmit(event: Event) {
    event.preventDefault();

    const email = this.newsletterEmail.trim();

    if (!email) {
      this.notify.error('Vui lòng nhập email!');
      return;
    }

    if (!this.newsletterService.validateEmail(email)) {
      this.notify.error('Email không hợp lệ!');
      return;
    }

    this.isSubmitting = true;

    this.newsletterService.subscribe(email).subscribe({
      next: () => {
        this.notify.success('Đăng ký thành công! Cảm ơn bạn đã quan tâm.');
        this.newsletterEmail = '';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.notify.error('Có lỗi xảy ra. Vui lòng thử lại!');
        console.error('Newsletter error:', err);
        this.isSubmitting = false;
      }
    });
  }

  // ========================================
  // CONTACT FORM SUBMIT
  // ========================================
  contactName = '';
  contactEmail = '';
  contactPhone = '';
  contactMessage = '';
  isSubmittingContact = false;

  onContactSubmit(event: Event) {
    event.preventDefault();

    // Validate
    if (!this.contactName || !this.contactEmail || !this.contactPhone || !this.contactMessage) {
      this.notify.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.contactEmail)) {
      this.notify.error('Email không hợp lệ!');
      return;
    }

    this.isSubmittingContact = true;

    // TODO: Gửi form contact đến server
    console.log('Contact form:', {
      name: this.contactName,
      email: this.contactEmail,
      phone: this.contactPhone,
      message: this.contactMessage
    });

    // Demo: Giả lập gửi thành công
    setTimeout(() => {
      this.notify.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong 24h.');

      // Reset form
      this.contactName = '';
      this.contactEmail = '';
      this.contactPhone = '';
      this.contactMessage = '';
      this.isSubmittingContact = false;
    }, 1000);
  }
}