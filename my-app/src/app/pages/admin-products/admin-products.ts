import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { Productservice } from '../../services/productservice';
import { ProductStateService } from '../../services/product-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-products',
  standalone: false,
  templateUrl: './admin-products.html',
  styleUrls: ['./admin-products.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminProducts implements OnInit, OnDestroy {
  user: any = null;
  products: any[] = [];
  filteredProducts: any[] = [];
  isLoading: boolean = false;
  filterSearch: string = '';
  private productStateSub?: Subscription;

  showForm: boolean = false;
  isEditing: boolean = false;
  formModel: any = {
    ProductId: '', ProductName: '', CategoryId: '',
    OriginalPrice: 0, Price: 0, StockQuantity: 0, Images: ''
  };
  selectedFile: File | null = null;

  constructor(
    private Authservice: Authservice,
    private notify: Notificationservice,
    private router: Router,
    private http: HttpClient,
    private productService: Productservice,
    private stateService: ProductStateService
  ) {}

  ngOnInit() {
    this.user = this.Authservice.getCurrentUser();
    if (!this.user || this.user.role !== 'admin') {
      this.notify.error('Bạn không có quyền truy cập trang này!');
      this.router.navigate(['/']);
    }
    this.productStateSub = this.stateService.products$.subscribe(data => {
      if (data && data.length > 0) this.convertProductsToTable(data);
    });
    this.loadProducts();
  }

  ngOnDestroy() {
    this.productStateSub?.unsubscribe();
  }

  loadProducts(forceReload?: boolean) {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (sections) => { this.convertProductsToTable(sections); this.isLoading = false; },
      error: (err) => { this.notify.error('Không thể tải danh sách sản phẩm'); console.error(err); this.isLoading = false; }
    });
  }

  onFilterChange() {
    const q = this.filterSearch.toLowerCase().trim();
    if (!q) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p =>
        (p.ProductName || '').toLowerCase().includes(q) ||
        (p.ProductId || '').toLowerCase().includes(q) ||
        (p.CategoryName || '').toLowerCase().includes(q)
      );
    }
  }

  formatCurrency(value: number): string {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  private convertProductsToTable(sections: any[]): void {
    this.products = [];
    if (sections && Array.isArray(sections)) {
      for (const section of sections) {
        if (section.products && Array.isArray(section.products)) {
          for (const p of section.products) {
            this.products.push({
              ProductId:     p.ProductId    || p.id,
              ProductName:   p.ProductName  || p.name,
              OriginalPrice: p.OriginalPrice || p.originalPrice || p.Price || p.price || 0,
              Price:         p.Price        || p.price || 0,
              StockQuantity: p.StockQuantity ?? p.stock ?? 0,
              CategoryName:  p.CategoryName || p.category || '',
              Images:        p.Images       || p.images   || [],
              IsActive:      p.IsActive !== undefined ? p.IsActive : true,
            });
          }
        }
      }
    }
    this.filteredProducts = [...this.products];
  }

  onGoBack() { this.router.navigate(['/admin']); }

  onAddProduct() { this.router.navigate(['/admin/products/fix', 'new']); }

  onEditProduct(product: any) {
    this.router.navigate(['/admin/products/fix', product.ProductId || product.id]);
  }

  onDeleteProduct(product: any) {
    const id = product.ProductId || product.id;
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.stateService.deleteProduct(id);
        this.stateService.clearCache();
        this.products = this.products.filter(p => (p.ProductId || p.id) !== id);
        this.filteredProducts = this.filteredProducts.filter(p => (p.ProductId || p.id) !== id);
        this.notify.success('Sản phẩm đã được xóa thành công!');
      },
      error: (err) => { console.error(err); this.notify.error('Xóa sản phẩm thất bại'); }
    });
  }

  resetForm() {
    this.formModel = { ProductId: '', ProductName: '', CategoryId: 'C001', OriginalPrice: 0, Price: 0, StockQuantity: 0, Images: '' };
  }

  saveForm() {
    const payload: any = Object.assign({}, this.formModel);
    if (payload.Images && typeof payload.Images === 'string') {
      payload.Images = payload.Images.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (!Array.isArray(payload.Images)) {
      payload.Images = [];
    }
    const obs = this.isEditing
      ? this.productService.updateProduct(payload.ProductId, payload)
      : this.productService.createProduct(payload);
    obs.subscribe({
      next: (res) => {
        this.notify.success(this.isEditing ? 'Cập nhật thành công' : 'Thêm thành công');
        this.showForm = false;
        this.stateService.clearCache();
        this.resetForm();
        this.loadProducts();
      },
      error: err => { this.notify.error('Thao tác thất bại'); console.error(err); }
    });
  }

  cancelForm() { this.showForm = false; this.resetForm(); }

  onFileChange(event: any) { this.selectedFile = event.target?.files?.[0] || null; }

  uploadImage() {
    if (!this.selectedFile) { this.notify.error('Vui lòng chọn file trước'); return; }
    const fd = new FormData();
    fd.append('image', this.selectedFile);
    this.http.post<any>('http://localhost:3003/upload', fd).subscribe({
      next: res => {
        if (res?.path) {
          const arr = (this.formModel.Images || '').split(',').map((s: string) => s.trim()).filter(Boolean);
          arr.push(res.path);
          this.formModel.Images = arr.join(', ');
          this.notify.success('Upload thành công');
          this.selectedFile = null;
        } else { this.notify.error('Upload thất bại'); }
      },
      error: err => { console.error(err); this.notify.error('Upload thất bại'); }
    });
  }

  onLogout() {
    this.Authservice.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }

  onManageBlogs() { this.router.navigate(['/admin/blogs']); }
}