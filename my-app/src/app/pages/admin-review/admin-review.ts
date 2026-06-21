import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { Reviewservice, Review } from '../../services/reviewservice';

@Component({
  selector: 'app-admin-review',
  standalone: false,
  templateUrl: './admin-review.html',
  styleUrls: ['./admin-review.css'],
})
export class AdminReview implements OnInit {
  user: any = null;
  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  isLoading = false;
  filterSearch = '';
  filterStatus: 'all' | 'approved' | 'unapproved' = 'all';

  constructor(
    private auth: Authservice,
    private notify: Notificationservice,
    private router: Router,
    private reviewService: Reviewservice
  ) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    if (!this.user || this.user.role !== 'admin') {
      this.notify.error('Bạn không có quyền truy cập trang này!');
      this.router.navigate(['/']);
      return;
    }
    this.loadReviews();
  }

  loadReviews(force = false) {
    this.isLoading = true;
    this.reviewService.getReviews().subscribe({
      next: (list) => {
        this.reviews = list || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.notify.error('Không thể tải danh sách đánh giá');
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    const term = this.filterSearch.toLowerCase().trim();
    this.filteredReviews = this.reviews.filter(review => {
      const matchesSearch = !term ||
        review.productName.toLowerCase().includes(term) ||
        review.productId.toLowerCase().includes(term) ||
        review.userName.toLowerCase().includes(term) ||
        review.comment.toLowerCase().includes(term);

      const matchesStatus = this.filterStatus === 'all'
        || (this.filterStatus === 'approved' && review.isApproved)
        || (this.filterStatus === 'unapproved' && !review.isApproved);

      return matchesSearch && matchesStatus;
    });
  }

  onFilterChange() {
    this.applyFilter();
  }

  toggleApproval(review: Review) {
    const nextStatus = !review.isApproved;
    const actionText = nextStatus ? 'duyệt' : 'hủy duyệt';
    this.reviewService.updateReview(review.id, { isApproved: nextStatus }).subscribe({
      next: () => {
        review.isApproved = nextStatus;
        this.notify.success(`Đã ${actionText} đánh giá thành công`);
        this.applyFilter();
      },
      error: (err) => {
        console.error(err);
        this.notify.error(`Không thể ${actionText} đánh giá`);
      }
    });
  }

  deleteReview(review: Review) {
    if (!confirm(`Xóa đánh giá của ${review.userName} cho sản phẩm ${review.productName}?`)) {
      return;
    }
    this.reviewService.deleteReview(review.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== review.id);
        this.applyFilter();
        this.notify.success('Đã xóa đánh giá');
      },
      error: (err) => {
        console.error(err);
        this.notify.error('Xóa đánh giá thất bại');
      }
    });
  }

  formatDate(value: string) {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }

  formatRating(value: number) {
    return value !== undefined && value !== null ? value.toFixed(1) : '0.0';
  }

  onLogout() {
    this.auth.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }
}
