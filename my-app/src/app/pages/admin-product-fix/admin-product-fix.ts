import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { ProductStateService } from '../../services/product-state.service';
import { Productservice, getCategoryFromId, getCategoryDisplayName } from '../../services/productservice';

@Component({
  selector: 'app-admin-product-fix',
  standalone: false,
  templateUrl: './admin-product-fix.html',
  styleUrl: './admin-product-fix.css',
  encapsulation: ViewEncapsulation.None,
})
export class AdminProductFix implements OnInit {
  productId: string = '';
  product: any = null;
  isLoading: boolean = true;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  selectedFile: File | null = null;
  isUploading: boolean = false;
  user: any = null;

  // Category list with display names for dropdown
  categoryList = [
    { id: 'C001', name: 'Hobo - Áo' },
    { id: 'C002', name: 'Hobo - Quần' },
    { id: 'C003', name: 'Streetwear - Áo' },
    { id: 'C004', name: 'Streetwear - Quần' },
    { id: 'C005', name: 'Casual - Áo' },
    { id: 'C006', name: 'Casual - Quần' },
    { id: 'C007', name: 'Minimal - Áo' },
    { id: 'C008', name: 'Minimal - Quần' },
    { id: 'C009', name: 'Giày / Sandals' },
    { id: 'C010', name: 'Phụ kiện - Khăn' },
    { id: 'C011', name: 'Phụ kiện - Mũ' },
    { id: 'C012', name: 'Phụ kiện - Ví' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: Authservice,
    private notify: Notificationservice,
    private stateService: ProductStateService,
    private productService: Productservice
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user || this.user.role !== 'admin') {
      this.notify.error('Bạn không có quyền truy cập trang này!');
      this.router.navigate(['/']);
      return;
    }

    this.route.params.subscribe(params => {
      this.productId = params['id'];
      if (this.productId === 'new') {
        // Create new product with auto-generated ID
        this.product = {
          ProductId: this.generateProductId(),
          ProductName: '',
          CategoryId: '',
          OriginalPrice: 0,
          Price: 0,
          StockQuantity: 0,
          Images: [],
          IsActive: true,
          IsFeatured: false,  // FIX: khởi tạo IsFeatured
        };
        this.isLoading = false;
      } else if (this.productId) {
        this.loadProductDetails();
      }
    });
  }

  loadProductDetails() {
    this.isLoading = true;

    // 1️⃣ Kiểm tra cache từ ProductStateService (danh sách đã load)
    const cachedProduct = this.findProductInState(this.productId);
    if (cachedProduct) {
      this.product = this.prepareProduct(cachedProduct);
      this.isLoading = false;
      return;
    }

    // 2️⃣ Sử dụng ProductService (có caching + shareReplay)
    this.productService.getProductById(this.productId).subscribe({
      next: (product) => {
        if (product) {
          this.product = this.prepareProduct(product);
          this.isLoading = false;
          this.stateService.setSingleProduct(product); // Update state
        } else {
          // 3️⃣ Fallback: Load tất cả products từ cache
          this.loadProductDetailsFromList();
        }
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.loadProductDetailsFromList();
      }
    });
  }

  /**
   * Tìm sản phẩm từ danh sách đã cache trong ProductStateService
   */
  private findProductInState(id: string): any {
    const products = this.stateService.getProductsSync();
    if (products && products.length > 0) {
      for (const section of products) {
        const found = section.products.find((p: any) => {
          return p.id === id || p.ProductId === id;
        });
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Chuẩn bị dữ liệu sản phẩm (convert Images string to array)
   */
  private prepareProduct(product: any): any {
    const prepared = { ...product };

    // Normalize field names (backend might use ProductId, frontend might use id)
    if (!prepared.ProductId && prepared.id) {
      prepared.ProductId = prepared.id;
    }
    if (!prepared.ProductName && prepared.name) {
      prepared.ProductName = prepared.name;
    }
    if (!prepared.Price && prepared.price) {
      prepared.Price = prepared.price;
    }
    if (!prepared.OriginalPrice && prepared.originalPrice) {
      prepared.OriginalPrice = prepared.originalPrice;
    }
    if (!prepared.StockQuantity && prepared.stock) {
      prepared.StockQuantity = prepared.stock;
    }

    // FIX: normalize IsFeatured (backend có thể trả về isFeatured hoặc IsFeatured)
    if (prepared.IsFeatured === undefined) {
      prepared.IsFeatured = prepared.isFeatured ?? false;
    }

    // Handle category
    if (!prepared.CategoryId && prepared.category) {
      if (prepared.category.startsWith('C')) {
        prepared.CategoryId = prepared.category;
      } else {
        prepared.CategoryId = this.findCategoryIdFromName(prepared.category) || 'C001';
      }
    } else if (!prepared.CategoryId) {
      prepared.CategoryId = 'C001';
    }

    // Set categoryName for display (C001 -> Hobo - Áo)
    prepared.categoryName = this.getCategoryDisplayNameById(prepared.CategoryId);

    // Convert Images string to array if needed
    if (typeof prepared.Images === 'string') {
      prepared.Images = prepared.Images
        .split(',')
        .map((img: string) => img.trim())
        .filter(Boolean);
    } else if (!Array.isArray(prepared.Images)) {
      prepared.Images = prepared.images || [];
    }

    return prepared;
  }

  /**
   * Find category ID (C001) from category name (hobo)
   */
  private findCategoryIdFromName(categoryName: string): string {
    const found = this.categoryList.find(c => {
      const nameLower = c.name.toLowerCase();
      const catLower = categoryName.toLowerCase();
      return nameLower.includes(catLower) || catLower.includes(nameLower.split(' ')[0].toLowerCase());
    });
    return found ? found.id : '';
  }

  /**
   * Get category display name from ID (C001 -> Hobo - Áo)
   */
  getCategoryDisplayNameById(categoryId: string): string {
    const found = this.categoryList.find(c => c.id === categoryId);
    return found ? found.name : categoryId;
  }

  loadProductDetailsFromList() {
    this.productService.getProducts().subscribe({
      next: (sections) => {
        let foundProduct: any = null;

        for (const section of sections) {
          const found = section.products.find((p: any) => {
            return p.id === this.productId || p.ProductId === this.productId;
          });
          if (found) {
            foundProduct = found;
            break;
          }
        }

        if (foundProduct) {
          this.product = this.prepareProduct(foundProduct);
          this.stateService.setSingleProduct(foundProduct);
        } else {
          this.notify.error('Sản phẩm không tồn tại');
          this.router.navigate(['/admin/products']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.notify.error('Không thể tải chi tiết sản phẩm');
        this.isLoading = false;
        this.router.navigate(['/admin/products']);
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target?.files?.[0];
    this.selectedFile = file || null;
  }

  uploadImage() {
    if (!this.selectedFile) {
      this.notify.error('Vui lòng chọn file trước');
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.isUploading = true;
    this.http.post<any>('http://localhost:3003/upload', formData).subscribe({
      next: (res) => {
        if (res?.path) {
          if (!this.product.Images) {
            this.product.Images = [];
          }
          if (typeof this.product.Images === 'string') {
            const arr = this.product.Images.split(',').map((s: string) => s.trim()).filter(Boolean);
            arr.push(res.path);
            this.product.Images = arr;
          } else if (Array.isArray(this.product.Images)) {
            this.product.Images.push(res.path);
          }
          this.isUploading = false;
          this.notify.success('Upload hình ảnh thành công');
          this.selectedFile = null;
        } else {
          this.isUploading = false;
          this.notify.error('Upload thất bại');
        }
      },
      error: (err) => {
        this.isUploading = false;
        console.error(err);
        this.notify.error('Upload hình ảnh thất bại');
      }
    });
  }

  removeImage(index: number) {
    if (Array.isArray(this.product.Images)) {
      this.product.Images.splice(index, 1);
    }
  }

  saveProduct() {
    if (!this.product.ProductName || !this.product.Price || this.product.StockQuantity < 0) {
      this.notify.error('Vui lòng điền đầy đủ thông tin sản phẩm');
      return;
    }

    if (!this.product.ProductId) {
      this.notify.error('Lỗi: ProductId không được tạo. Vui lòng tải lại trang!');
      return;
    }

    this.isSaving = true;

    const imagesArray = Array.isArray(this.product.Images)
      ? this.product.Images
      : typeof this.product.Images === 'string'
        ? this.product.Images.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

    // FIX: thêm IsFeatured vào payload để backend lưu đúng
    const payload = {
      ProductId:     this.product.ProductId,
      ProductName:   this.product.ProductName,
      CategoryId:    this.product.CategoryId || '',
      OriginalPrice: this.product.OriginalPrice || 0,
      Price:         this.product.Price,
      StockQuantity: this.product.StockQuantity,
      Images:        imagesArray,
      IsActive:      this.product.IsActive ?? true,
      IsFeatured:    this.product.IsFeatured ?? false,
    };

    console.log('Sending payload:', payload);

    if (this.productId === 'new') {
      this.productService.createProduct(payload).subscribe({
        next: (res) => {
          this.notify.success('Tạo sản phẩm mới thành công');
          this.isSaving = false;
          const created = res?.product ? this.prepareProduct(res.product) : this.product;
          const categoryId = created.CategoryId || 'C001';
          this.stateService.addProduct(created, categoryId);
          this.stateService.clearCache();
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.notify.error('Tạo sản phẩm thất bại: ' + (err.error?.error || err.message));
          console.error('Create error:', err);
          this.isSaving = false;
        }
      });
    } else {
      this.productService.updateProduct(this.productId, payload).subscribe({
        next: (res) => {
          this.notify.success('Cập nhật sản phẩm thành công');
          this.isSaving = false;
          const updated = res?.product ? this.prepareProduct(res.product) : this.product;
          this.stateService.updateProduct(updated);
          this.stateService.clearCache();
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.notify.error('Cập nhật sản phẩm thất bại: ' + (err.error?.error || err.message));
          console.error('Update error:', err);
          this.isSaving = false;
        }
      });
    }
  }

  /**
   * Generate unique ProductId (timestamp + random)
   */
  private generateProductId(): string {
    return `PROD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  deleteProduct() {
    if (!this.product.ProductId) {
      this.notify.error('Không thể xóa sản phẩm chưa được tạo');
      return;
    }

    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác!')) {
      return;
    }

    this.isDeleting = true;
    this.http.delete(`http://localhost:3003/products/${this.productId}`).subscribe({
      next: (res) => {
        this.notify.success('Sản phẩm đã được xóa thành công');
        this.isDeleting = false;
        this.stateService.deleteProduct(this.productId);
        this.stateService.clearCache();
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        this.notify.error('Xóa sản phẩm thất bại');
        console.error(err);
        this.isDeleting = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/products']);
  }

  onManageBlogs() {
    this.router.navigate(['/admin/blogs']);
  }

  onLogout() {
    this.authService.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }
}