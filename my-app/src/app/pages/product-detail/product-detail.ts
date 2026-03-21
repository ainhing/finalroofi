import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, Productservice } from '../../services/productservice';
import { ProductStateService } from '../../services/product-state.service';
import { Cartservice } from '../../services/cartservice';
import { Buynowservice } from '../../services/buynowservice';
import { Wishlistservice } from '../../services/wishlistservice';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetail implements OnInit, OnDestroy {
  // Main image binding and thumbnail selector
  mainImage: string='';
  selectImage(src: string): void { this.mainImage = src; }
  product: Product | undefined;
  quantity: number = 1;

  selectedSize: string = '';       // Size đang chọn
  availableSizes: string[] = ['S', 'M', 'L', 'XL']; // Danh sách size
  showSizeChart: boolean = false;

  relatedProducts: Product[] = [];
  mainLiked = false;

  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  timeoutId: any;
  private wishlistSub?: Subscription;
  private singleProductSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: Productservice,
    private stateService: ProductStateService,
    private cartService: Cartservice,
    private buyNowService: Buynowservice,
    private cdr: ChangeDetectorRef,
    private wishlistService: Wishlistservice
  ) {}

  ngOnInit(): void {
    this.wishlistService.syncFromStorage();
    this.wishlistSub = this.wishlistService.wishlistChanges$.subscribe(ids => this.applyWishlistState(ids));

    // Lắng nghe thay đổi sản phẩm real-time từ ProductStateService
    this.singleProductSub = this.stateService.singleProduct$.subscribe(product => {
      if (product) {
        this.product = product;
        this.mainImage = product.image;
        this.selectedSize = '';
        this.mainLiked = this.wishlistService.isInWishlist(product.id);
        this.getRelatedProducts(product);
        this.cdr.detectChanges();
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProductData(id);
      }
    });
  }

  loadProductData(id: string) {
    this.productService.getProductById(id).subscribe((data) => {
      this.product = data;
      if (data) {
        this.mainImage = data.image;
        this.selectedSize = '';
        this.mainLiked = this.wishlistService.isInWishlist(data.id);
        this.stateService.setSingleProduct(data); // Broadcast tới subscribers
        // Gọi hàm lấy sản phẩm tương tự
        this.getRelatedProducts(data);
      }
    });
  }

  getRelatedProducts(currentProduct: Product) {
    this.productService.getProducts().subscribe(sections => {
      // Gộp tất cả sản phẩm từ các section lại thành 1 mảng
      const allProducts: Product[] = sections.reduce((acc, section) => {
        return acc.concat(section.products);
      }, [] as Product[]);

      // Lọc sản phẩm cùng CategoryId (C001, C002, etc.) và khác ID hiện tại
      // This ensures products from the same category (e.g., Hobo - Áo) are shown together
      this.relatedProducts = allProducts.filter(p => 
        p.categoryId === currentProduct.categoryId && p.id !== currentProduct.id
      );

      // Lấy tối đa 4 sản phẩm
      const liked = new Set(this.wishlistService.getWishlist());
      this.relatedProducts = this.relatedProducts
        .slice(0, 4)
        .map(p => ({ ...p, liked: liked.has(p.id) } as any));

      this.applyWishlistState(this.wishlistService.getWishlist());
    });
  }
  // loadProductData(id: string) {
  //   this.productService.getProductById(id).subscribe((data) => {
  //     this.product = data;
  //     if (data) {
  //       this.mainImage = data.image;
  //       this.selectedSize = ''; // Reset size khi đổi sản phẩm
        
  //       // Sau khi có thông tin sản phẩm -> Tìm sản phẩm tương tự
  //       this.getRelatedProducts(data);
  //     }
  //   });
  // }
// getRelatedProducts(currentProduct: Product) {
//     this.productService.getProducts().subscribe(allProducts => {
      
//       const allProducts: Product[] = sections.reduce((acc, section) => {
//         return acc.concat(section.products);
//       }, [] as Product[]);

//       // BƯỚC 2: Bây giờ mới lọc trên danh sách đã gộp
//       this.relatedProducts = allProducts.filter(p => 
//         // Lọc sp cùng category và KHÁC id hiện tại
//         p.category === currentProduct.category && p.id !== currentProduct.id
//       );

  //     // Lấy 4 sản phẩm
  //     this.relatedProducts = this.relatedProducts.slice(0, 4);
  //   });
  // }
  
  updateQuantity(change: number) {
    const newQty = this.quantity + change;
    if (newQty >= 1) this.quantity = newQty;
  }
  selectSize(size: string): void {
    this.selectedSize = size;
  }

  toggleSizeChart(): void {
    this.showSizeChart = !this.showSizeChart;
  }

  buyNow(): void {
    if (!this.selectedSize) {
      this.showToast('Vui lòng chọn kích thước để mua ngay!', 'error');
      return;
    }
    
    // Lưu sản phẩm mua ngay vào BuyNow service
    const buyNowItem = {
      productId: this.product?.id || '',
      name: this.product?.name || '',
      price: this.product?.price || 0,
      quantity: this.quantity,
      image: this.mainImage,
      size: this.selectedSize
    };
    
    // Set vào BuyNow service
    this.buyNowService.setBuyNowItem(buyNowItem);
    
    this.showToast(`Đã chuyển ${this.product?.name} (Size: ${this.selectedSize}) tới trang thanh toán!`);
    this.router.navigate(['/buynow-checkout']);
  }

  toggleMainWishlist(): void {
    if (!this.product) return;
    this.mainLiked = this.wishlistService.toggle(this.product.id);
  }

  toggleRelatedWishlist(event: Event, product: any): void {
    event.stopPropagation();
    const nowLiked = this.wishlistService.toggle(product.id);
    product.liked = nowLiked;
  }

  addToCart(product?: Product): void {
    if (product) {
      // Xử lý related products
      this.cartService.add({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1, // Related products default quantity = 1
        image: product.image,
        size: 'M' // Default size for related products
      });

      // Hiện thông báo đẹp
      this.showToast(`Đã thêm: ${product.name}`);
    } else {
      // Xử lý main product
      if (!this.selectedSize) {
        this.showToast('Vui lòng chọn kích thước trước khi thêm!', 'error');
        return;
      }

      if (this.product) {
        // 1. Gọi Service
        this.cartService.add({
          productId: this.product.id,
          name: this.product.name,
          price: this.product.price,
          quantity: this.quantity,
          image: this.mainImage, // Lấy ảnh đang chọn (có thể là ảnh màu khác)
          size: this.selectedSize
        });

        // 2. Hiện thông báo đẹp
        this.showToast(`Đã thêm: ${this.product.name} - Size ${this.selectedSize}`);
      }
    }
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    this.cdr.detectChanges();

    // Xóa timeout cũ nếu người dùng bấm liên tục
    if (this.timeoutId) clearTimeout(this.timeoutId);

    // Tự động tắt sau 4 giây
    this.timeoutId = setTimeout(() => {
      this.closeToast();
    }, 3000);
  }

  // Hàm tắt thông báo
  closeToast() {
    this.showNotification = false;
    this.cdr.detectChanges();
  }
 
  ngOnDestroy(): void {
    this.wishlistSub?.unsubscribe();
    this.singleProductSub?.unsubscribe();
  }

  private applyWishlistState(ids: string[]): void {
    const liked = new Set(ids.map(id => id.toString()));
    if (this.product) {
      this.mainLiked = liked.has(this.product.id.toString());
    }
    if (this.relatedProducts?.length) {
      this.relatedProducts = this.relatedProducts.map(p => ({ ...p, liked: liked.has(p.id.toString()) } as any));
    }
    this.cdr.detectChanges();
  }
}
