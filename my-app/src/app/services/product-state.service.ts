import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, ProductSection } from './productservice';

@Injectable({ providedIn: 'root' })
export class ProductStateService {
  private productsSubject      = new BehaviorSubject<ProductSection[]>([]);
  private singleProductSubject = new BehaviorSubject<Product | undefined>(undefined);

  public products$      = this.productsSubject.asObservable();
  public singleProduct$ = this.singleProductSubject.asObservable();

  private cache: { [key: string]: { data: any; timestamp: number } } = {};
  private cacheExpiry = 5 * 60 * 1000; // 5 phút

  constructor() {}

  getFromCache(key: string): any {
    if (this.cache[key]) {
      const now = Date.now();
      if (now - this.cache[key].timestamp < this.cacheExpiry) {
        return this.cache[key].data;
      } else {
        delete this.cache[key];
      }
    }
    return null;
  }

  setCache(key: string, data: any): void {
    this.cache[key] = { data, timestamp: Date.now() };
  }

  setProducts(products: ProductSection[]): void {
    this.productsSubject.next(products);
    this.setCache('all_products', products);
  }

  setSingleProduct(product: Product | undefined): void {
    this.singleProductSubject.next(product);
    if (product) {
      // FIX: cache bằng cả id lẫn ProductId để đảm bảo tìm thấy từ cả hai phía
      const pid = product.id || (product as any).ProductId;
      if (pid) this.setCache(`product_${pid}`, product);
    }
  }

  /**
   * FIX: so sánh bằng cả p.id lẫn (p as any).ProductId để không bỏ sót
   * trường hợp backend trả về ProductId nhưng frontend lưu bằng id
   */
  updateProduct(product: Product): void {
    this.setSingleProduct(product);

    // Lấy id chuẩn để so sánh (ưu tiên id, fallback về ProductId)
    const targetId = product.id || (product as any).ProductId;

    const currentProducts = this.productsSubject.value;
    const updatedProducts = currentProducts.map(section => ({
      ...section,
      products: section.products.map(p => {
        const pId = p.id || (p as any).ProductId;
        return pId === targetId ? { ...p, ...product, id: pId } : p;
      })
    }));

    this.setProducts(updatedProducts);
  }

  addProduct(product: Product, categorySection: string): void {
    const currentProducts = this.productsSubject.value;

    // FIX: tìm section theo categoryId (C001, C002, ...) hoặc category name
    const updatedProducts = currentProducts.map(section => {
      const matchById   = section.categoryId === categorySection;
      const matchByName = section.category   === categorySection;
      if (matchById || matchByName) {
        return { ...section, products: [...section.products, product] };
      }
      return section;
    });

    // Nếu không có section nào khớp (category mới), tạo section mới
    const hasMatch = currentProducts.some(
      s => s.categoryId === categorySection || s.category === categorySection
    );
    if (!hasMatch) {
      updatedProducts.push({
        title:      categorySection,
        category:   categorySection,
        categoryId: categorySection,
        products:   [product]
      });
    }

    this.setProducts(updatedProducts);
  }

  deleteProduct(productId: string): void {
    const currentProducts = this.productsSubject.value;
    const updatedProducts = currentProducts.map(section => ({
      ...section,
      // FIX: so sánh bằng cả id lẫn ProductId
      products: section.products.filter(p => {
        const pId = p.id || (p as any).ProductId;
        return pId !== productId;
      })
    }));

    this.setProducts(updatedProducts);
    this.cache[`product_${productId}`] = { data: undefined, timestamp: Date.now() };
  }

  clearCache(key?: string): void {
    if (key) {
      delete this.cache[key];
    } else {
      this.cache = {};
    }
  }

  getProductsSync(): ProductSection[] {
    return this.productsSubject.value;
  }

  getSingleProductSync(): Product | undefined {
    return this.singleProductSubject.value;
  }
}