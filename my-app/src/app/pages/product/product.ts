import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Productservice } from '../../services/productservice';
import { ProductStateService } from '../../services/product-state.service';
import { Cartservice } from '../../services/cartservice';
import { Wishlistservice } from '../../services/wishlistservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface Product {
  id: string; // hoặc number tùy DB của bạn
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  material: string;
  liked?: boolean;
}

interface ProductSection {
  title: string;
  category: string;
  categoryId?: string;
  categoryName?: string;
  type?: string;
  products: Product[];
}

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.html',
  styleUrls: ['./product.css']
})
export class ProductComponent implements OnInit, OnDestroy {
  productSections: ProductSection[] = [];
  originalProductSections: ProductSection[] = [];
  private wishlistSub?: Subscription;
  private productStateSub?: Subscription;

  // Toast notifications
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success'; 
  timeoutId: any;

  constructor(
    private productService: Productservice,
    private stateService: ProductStateService,
    private cartService: Cartservice,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private wishlistService: Wishlistservice
  ) {}

  ngOnInit(): void {
    // Ensure we load wishlist state for the current user
    this.wishlistService.syncFromStorage();

    // React to wishlist changes across the app (hearts stay in sync)
    this.wishlistSub = this.wishlistService.wishlistChanges$.subscribe(ids => {
      this.applyWishlistState(ids);
      this.cdr.detectChanges();
    });

    // Lắng nghe thay đổi real-time từ ProductStateService
    this.productStateSub = this.stateService.products$.subscribe(data => {
      if (data && data.length > 0) {
        this.originalProductSections = JSON.parse(JSON.stringify(data));
        this.productSections = data;
        this.applyWishlistState();
        this.cdr.detectChanges();
      }
    });

    // Lấy dữ liệu sản phẩm
    this.productService.getProducts().subscribe(data => {
      this.originalProductSections = JSON.parse(JSON.stringify(data));
      this.productSections = data;
      this.applyWishlistState();

      // Lắng nghe thay đổi URL để lọc sản phẩm
      this.route.queryParams.subscribe(params => {
        const category = params['category'];
        const type = params['type'];
        
        this.filterProducts(category, type);
      });
    });
  }

  private applyWishlistState(ids?: string[]): void {
    const liked = new Set((ids ?? this.wishlistService.getWishlist()).map(id => id.toString()));
    // Keep both live and source collections in sync so filtering/sorting retains state
    const applyTo = (sections: ProductSection[]) => {
      sections.forEach(section => {
        section.products.forEach(p => (p as any).liked = liked.has(p.id.toString()));
      });
    };
    applyTo(this.productSections);
    applyTo(this.originalProductSections);
  }

  // Lọc sản phẩm theo category và type
  // category có thể là CategoryId (C001...) hoặc tên (hobo, streetwear...)
  filterProducts(category?: string, type?: string): void {
    if (!category && !type) {
      this.productSections = JSON.parse(JSON.stringify(this.originalProductSections));
      this.applyWishlistState();
      return;
    }

    this.productSections = this.originalProductSections.filter(section => {
      if (!category) return true;
      // So sánh theo categoryId (C001, C002...) — ưu tiên khi click từ header/dropdown
      const matchById   = section.categoryId?.toUpperCase() === category.toUpperCase();
      // Fallback theo tên category (hobo, streetwear...) — khi lọc theo tên
      const matchByName = section.category?.toLowerCase() === category.toLowerCase();
      return matchById || matchByName;
    });

    this.applyWishlistState();
    console.log(`Filtered: category=${category}, result=${this.productSections.length} sections`);
  }

  // Cuộn đến đầu trang
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.closeAllDropdowns();
    this.router.navigate(['/product']);
  }

  // Cuộn đến category cụ thể
  scrollToCategory(categoryId: string): void {
    this.closeAllDropdowns();
    
    // Cập nhật URL với category
    this.router.navigate(['/product'], { 
      queryParams: { category: categoryId }
    });
  }
showAllProducts(): void {
  this.closeAllDropdowns();
  this.router.navigate(['/product']);  // Reset URL về /product
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
  // Đóng tất cả dropdown
  closeAllDropdowns(): void {
    document.querySelectorAll('.eco-dropdown.open').forEach(el => {
      el.classList.remove('open');
    });
  }

  // Sắp xếp sản phẩm theo giá
  onPriceSelect(sortType: string): void {
    if (sortType === 'default') {
      this.productSections = JSON.parse(JSON.stringify(this.originalProductSections));
      // Reapply current filters if any
      const params = this.route.snapshot.queryParams;
      if (params['category'] || params['type']) {
        this.filterProducts(params['category'], params['type']);
      }
    } else {
      this.productSections.forEach(section => {
        section.products.sort((a, b) => {
          if (sortType === 'low-high') {
            return a.price - b.price;
          } else if (sortType === 'high-low') {
            return b.price - a.price;
          }
          return 0;
        });
      });
    }
  }

  // Cập nhật label cho dropdown giá
  updateLabel(label: string): void {
    const labelElement = document.getElementById('priceLabel');
    if (labelElement) {
      labelElement.innerText = label;
    }
  }

  // Cập nhật label cho dropdown danh mục
  updateCategoryLabel(label: string): void {
    const labelElement = document.getElementById('categoryLabel');
    if (labelElement) {
      labelElement.innerText = label;
    }
  }

  // Cuộn section sản phẩm
  scrollSection(container: HTMLElement, direction: 'left' | 'right'): void {
    const scrollAmount = 300;
    
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  // Thêm sản phẩm vào giỏ hàng
  addToCart(event: Event, product: Product): void {
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

  toggleWishlist(event: Event, product: any): void {
    event.stopPropagation();
    event.preventDefault();
    const nowLiked = this.wishlistService.toggle(product.id);
    product.liked = nowLiked;
    // Mirror to original collection so future filters/sorts keep the state
    this.setLikedFlag(product.id, nowLiked);
    this.showToast(nowLiked ? `Đã thêm "${product.name}" vào yêu thích` : `Đã xóa "${product.name}" khỏi yêu thích`, 'success');
  }

  private setLikedFlag(productId: string, liked: boolean): void {
    const applyTo = (sections: ProductSection[]) => {
      sections.forEach(section => {
        section.products.forEach(p => {
          if (p.id.toString() === productId.toString()) {
            (p as any).liked = liked;
          }
        });
      });
    };
    applyTo(this.productSections);
    applyTo(this.originalProductSections);
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

  ngOnDestroy(): void {
    this.wishlistSub?.unsubscribe();
    this.productStateSub?.unsubscribe();
  }
}