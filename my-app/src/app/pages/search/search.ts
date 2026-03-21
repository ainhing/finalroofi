import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Product, Productservice } from '../../services/productservice';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search.html'
})
export class Search {
  keyword = '';
  results: Product[] = [];

  constructor(
    private productService: Productservice,
    private router: Router
  ) {}

  onSearch() {
    const value = this.keyword.trim();

    if (!value) {
      this.results = [];
      return;
    }

    this.productService.search(value).subscribe({
      next: (res) => {
        this.results = res || [];
        console.log('Kết quả search:', this.results);
      },
      error: (err) => {
        console.error('Lỗi search:', err);
        this.results = [];
      }
    });
  }

  onSelectProduct(productId: string) {
    this.keyword = '';
    this.results = [];
    this.router.navigate(['/product-detail', productId]);
  }
}