import { Component, ChangeDetectorRef, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Cartservice } from '../../services/cartservice';
import { Voucher, Voucherservice } from '../../services/voucherservice';
import { Wishlistservice } from '../../services/wishlistservice';
import { Productservice } from '../../services/productservice';
import { ProductStateService } from '../../services/product-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-hot-offers',
  templateUrl: './hot-offers.html',
  standalone: false
})
export class HotOffers implements OnInit, OnDestroy {
  // ==================== TOAST NOTIFICATION ====================
  showNotification = false;
  notificationMessage = '';
  timeoutId: any;

  // ==================== QUICKVIEW ====================
  selectedProduct: any = null;

  // ==================== DEAL OF THE DAY PRODUCTS ====================
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
    {
      id: 2,
      name: 'Áo Voan Thêu Hoa EcoSoft',
      image: 'assets/images/hobo/hobo_aokieu/Hobo_Aokieu1/Hobo_Aokieu1.1.jpg',
      price: 560000,
      oldPrice: 720000,
      sizes: ['S', 'M', 'L', 'XL'],
      material: '100% Organic Cotton',
      liked: false
    },
    {
      id: 3,
      name: 'Áo Ren EcoLace Satin',
      image: 'assets/images/hobo/hobo_aokieu/Hobo_Aokieu2/Hobo_Aokieu2.1.jpg',
      price: 520000,
      oldPrice: 650000,
      sizes: ['S', 'M', 'L'],
      material: '100% Organic Cotton',
      liked: false
    },
    {
      id: 4,
      name: 'Áo Voan Hoa ReBloom',
      image: 'assets/images/hobo/hobo_aokieu/Hobo_Aokieu3/Hobo_Aokieu3.1.jpg',
      price: 480000,
      oldPrice: 650000,
      sizes: ['M', 'L', 'XL'],
      material: '100% Organic Cotton',
      liked: false
    }
  ];

  // ==================== VOUCHERS ====================
  vouchers: Voucher[] = [];

  // ==================== SUBSCRIPTIONS ====================
  private productSub?: Subscription;

  constructor(
    private cartService: Cartservice,
    private voucherService: Voucherservice,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private wishlistService: Wishlistservice,
    private productService: Productservice,
    private stateService: ProductStateService
  ) {}

  ngOnInit(): void {
    this.vouchers = this.voucherService.getVouchers();

    // Listen for product updates from admin (real-time)
    this.productSub = this.stateService.products$.subscribe(sections => {
      this.updateDealProductsFromServer(sections);
      this.applyWishlistState(this.wishlistService.getWishlist());
      this.cdr.detectChanges();
    });

    // Load products from API to trigger state update
    this.productService.getProducts().subscribe(() => {
      this.applyWishlistState(this.wishlistService.getWishlist());
      this.cdr.detectChanges();
    });

    this.applyWishlistState(this.wishlistService.getWishlist());
  }

  /**
   * FIX: Cập nhật dealOfTheDayProducts từ server, ưu tiên sản phẩm có IsFeatured = true
   */
  private updateDealProductsFromServer(sections: any[]): void {
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

    // Nếu có sản phẩm nổi bật thì dùng, nếu không fallback về 4 sản phẩm đầu
    const source = featured.length > 0 ? featured : allProducts;

    this.dealOfTheDayProducts = source.slice(0, 4).map((p: any) => ({
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

  private applyWishlistState(ids: string[]): void {
    const liked = new Set(ids.map(id => id.toString()));
    this.dealOfTheDayProducts = this.dealOfTheDayProducts.map(p => ({ ...p, liked: liked.has(p.id.toString()) }));
  }

  // ==================== QUICKVIEW METHODS ====================
  openQuickView(product: any) {
    this.selectedProduct = product;
  }

  closeQuickView() {
    this.selectedProduct = null;
  }

  // ==================== VOUCHER METHOD ====================
  saveVoucher(voucher: Voucher) {
    this.voucherService.saveVoucher(voucher.code);
    this.vouchers = this.voucherService.getVouchers();
    this.showToast(`Đã lưu voucher "${voucher.code}" thành công!`, 'success');
  }

  // ==================== WISHLIST ====================
  toggleLike(event: Event, product: any) {
    event.stopPropagation();
    const nowLiked = this.wishlistService.toggle(product.id.toString());
    product.liked = nowLiked;
    this.showToast(
      nowLiked
        ? `Đã thêm "${product.name}" vào yêu thích ♡`
        : `Đã xóa "${product.name}" khỏi yêu thích`,
      'success'
    );
  }

  // ==================== TOAST METHODS ====================
  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = message;
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

  closeToast() {
    this.showNotification = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.productSub?.unsubscribe();
  }
}