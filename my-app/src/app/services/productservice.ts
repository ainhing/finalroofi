import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, shareReplay, catchError } from 'rxjs/operators';
import { ProductStateService } from './product-state.service';

export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  material: string;
  description?: string;
  images?: string[];
  category?: string;
  categoryId?: string;
  categoryName?: string;
  liked?: boolean;
  // FIX: thêm IsActive và IsFeatured vào interface
  IsActive?: boolean;
  IsFeatured?: boolean;
}

export interface ProductSection {
  title: string;
  category: string;
  categoryId?: string;
  categoryName?: string;
  type?: string;
  products: Product[];
}

const CATEGORY_MAP: { [key: string]: string } = {
  'C001': 'hobo',
  'C002': 'hobo',
  'C003': 'streetwear',
  'C004': 'streetwear',
  'C005': 'casual',
  'C006': 'casual',
  'C007': 'minimal',
  'C008': 'minimal',
  'C009': 'giay',
  'C010': 'phukien',
  'C011': 'phukien',
  'C012': 'phukien'
};

const CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  'C001': 'Hobo - Áo',
  'C002': 'Hobo - Quần',
  'C003': 'Streetwear - Áo',
  'C004': 'Streetwear - Quần',
  'C005': 'Casual - Áo',
  'C006': 'Casual - Quần',
  'C007': 'Minimal - Áo',
  'C008': 'Minimal - Quần',
  'C009': 'Giày / Sandals',
  'C010': 'Phụ kiện - Khăn',
  'C011': 'Phụ kiện - Mũ',
  'C012': 'Phụ kiện - Ví'
};

export function getCategoryFromId(categoryId: string): string {
  if (!categoryId) return '';
  return CATEGORY_MAP[categoryId] || categoryId.toLowerCase();
}

export function getCategoryDisplayName(categoryOrId: string): string {
  if (!categoryOrId) return '';
  if (categoryOrId.startsWith('C') && CATEGORY_DISPLAY_NAMES[categoryOrId]) {
    return CATEGORY_DISPLAY_NAMES[categoryOrId];
  }
  return CATEGORY_DISPLAY_NAMES[categoryOrId.toUpperCase()] ||
         CATEGORY_DISPLAY_NAMES[categoryOrId] ||
         categoryOrId.charAt(0).toUpperCase() + categoryOrId.slice(1);
}

export function getSectionKey(categoryId: string, type: string): string {
  return categoryId || type;
}

@Injectable({ providedIn: 'root' })
export class Productservice {
  private apiUrl = 'http://localhost:3003/products';

  private getProductsCache$: Observable<ProductSection[]> | null = null;

  constructor(
    private http: HttpClient,
    private stateService: ProductStateService
  ) {}

  getProducts(): Observable<ProductSection[]> {
    if (this.getProductsCache$) {
      return this.getProductsCache$;
    }

    this.getProductsCache$ = this.http.get<any>(this.apiUrl).pipe(
      map(resp => resp?.data || []),
      map((raw: any[]) => {
        const sectionsMap: { [key: string]: ProductSection } = {};

        raw.forEach(item => {
          const categoryId = item.CategoryId || item.category || '';
          let category = getCategoryFromId(categoryId);
          let type = '';

          if (!categoryId && Array.isArray(item.Images) && item.Images.length) {
            const parts = item.Images[0].split('/');
            const idx = parts.findIndex((p: string) => p === 'images');
            if (idx >= 0 && parts.length > idx + 1) {
              category = parts[idx + 1];
            }
            if (idx >= 0 && parts.length > idx + 2) {
              const second = parts[idx + 2];
              const tokens = second.split('_');
              if (tokens.length > 1) {
                type = tokens[1];
                if (type === 'aokieu') type = 'ao';
              }
            }
          }

          const categoryName = getCategoryDisplayName(categoryId);
          const key = categoryId || `${category}|${type}`;

          if (!sectionsMap[key]) {
            let title = categoryName || 'UNKNOWN';
            if (type && !categoryId) title += ' - ' + type.toUpperCase();
            sectionsMap[key] = { title, category, categoryId, categoryName, type, products: [] };
          }

          sectionsMap[key].products.push({
            id:            item.ProductId,
            name:          item.ProductName,
            image:         Array.isArray(item.Images) && item.Images.length ? item.Images[0] : '',
            price:         item.Price,
            originalPrice: item.OriginalPrice,
            material:      item.Material || '',
            description:   item.Description,
            images:        item.Images,
            category:      category,
            categoryId:    categoryId,
            categoryName:  categoryName,
            // FIX: map IsActive và IsFeatured từ backend response
            IsActive:   item.IsActive   !== undefined ? item.IsActive   : true,
            IsFeatured: item.IsFeatured !== undefined ? item.IsFeatured : false,
          } as Product);
        });

        return Object.values(sectionsMap);
      }),
      tap(data => this.stateService.setProducts(data)),
      shareReplay(1),
      catchError(err => {
        console.error('Error fetching products from API', err);
        return of([] as ProductSection[]);
      })
    );

    return this.getProductsCache$;
  }

  getAllProducts(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(sections => sections.reduce((acc, section) => acc.concat(section.products), [] as Product[]))
    );
  }

  getProductsByIds(ids: string[]): Observable<Product[]> {
    const lowerIds = ids.map(id => id.toLowerCase());
    return this.getAllProducts().pipe(
      map(all => all.filter(p => lowerIds.includes(p.id.toLowerCase())))
    );
  }

  getProductById(id: string): Observable<Product | undefined> {
    const cached = this.stateService.getFromCache(`product_${id}`);
    if (cached !== null) {
      return of(cached);
    }

    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(resp => {
        const raw = resp && resp.product ? resp.product : undefined;
        if (!raw) return undefined;

        const categoryId   = raw.CategoryId || '';
        const category     = getCategoryFromId(categoryId);
        const categoryName = getCategoryDisplayName(categoryId);

        const product: Product = {
          id:            raw.ProductId,
          name:          raw.ProductName,
          image:         Array.isArray(raw.Images) && raw.Images.length ? raw.Images[0] : '',
          price:         raw.Price,
          originalPrice: raw.OriginalPrice,
          material:      raw.Material || '',
          description:   raw.Description,
          images:        raw.Images,
          category:      category,
          categoryId:    categoryId,
          categoryName:  categoryName,
          // FIX: map IsActive và IsFeatured từ backend response
          IsActive:   raw.IsActive   !== undefined ? raw.IsActive   : true,
          IsFeatured: raw.IsFeatured !== undefined ? raw.IsFeatured : false,
        } as any;

        this.stateService.setSingleProduct(product);
        return product;
      }),
      catchError(err => {
        console.error('Error fetching product by id from API', err);
        return of(undefined);
      })
    );
  }

  createProduct(payload: any): Observable<any> {
    this.getProductsCache$ = null;
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateProduct(id: string, payload: any): Observable<any> {
    this.getProductsCache$ = null;
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteProduct(id: string): Observable<any> {
    this.getProductsCache$ = null;
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  search(keyword: string): Observable<Product[]> {
    const lowerKeyword = keyword.toLowerCase().trim();
    return this.getAllProducts().pipe(
      map(all => all.filter(p =>
        p.name.toLowerCase().includes(lowerKeyword) ||
        p.material.toLowerCase().includes(lowerKeyword)
      ))
    );
  }
}