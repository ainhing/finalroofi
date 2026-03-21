import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { HttpClient } from '@angular/common/http';
import { BlogService } from '../../services/blog-service';

@Component({
  selector: 'app-admin-blog',
  standalone: false,
  templateUrl: './admin-blog.html',
  styleUrls: ['./admin-blog.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminBlog implements OnInit {
  user: any = null;
  blogs: any[] = [];
  filteredBlogs: any[] = [];
  isLoading: boolean = false;
  searchText: string = '';
  filterStatus: string = 'all';

  private apiUrl = 'http://localhost:3003/blogs';

  constructor(
    private authService: Authservice,
    private notify: Notificationservice,
    private router: Router,
    private blogService: BlogService,
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user || this.user.role !== 'admin') {
      this.notify.error('Bạn không có quyền truy cập trang này!');
      this.router.navigate(['/']);
      return;
    }
    this.loadBlogs();
  }

  get publishedCount(): number {
    return this.blogs.filter(b => b.isPublished).length;
  }

  get draftCount(): number {
    return this.blogs.filter(b => !b.isPublished).length;
  }

  applyFilter() {
    let result = [...this.blogs];

    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase().trim();
      result = result.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q)
      );
    }

    if (this.filterStatus === 'published') {
      result = result.filter(b => b.isPublished);
    } else if (this.filterStatus === 'draft') {
      result = result.filter(b => !b.isPublished);
    }

    this.filteredBlogs = result;
  }

  onSearchChange(value: string) {
    this.searchText = value;
    this.applyFilter();
  }

  onFilterChange(value: string) {
    this.filterStatus = value;
    this.applyFilter();
  }

  loadBlogs() {
  this.isLoading = true;
  this.blogService.getBlogs(true).subscribe({
    next: (list) => {
      // list đã normalize trong service rồi
      this.blogs = (list || []).map(b => ({
        id: b.id,
        title: b.title,
        author: b.author,
        isPublished: b.isPublished,
        createdAt: b.createdAt,
        tags: b.tags || [],
        coverImage: b.coverImage || ''
      }));
      this.filteredBlogs = [...this.blogs];
      this.isLoading = false;
    },
    error: (err) => {
      console.error(err);
      this.notify.error('Không thể tải danh sách blog');
      this.isLoading = false;
    }
  });
}

  onAddBlog() {
    this.router.navigate(['/admin/blogs/fix', 'new']);
  }

  onEditBlog(blog: any) {
    this.router.navigate(['/admin/blogs/fix', blog.id]);
  }

  onDeleteBlog(blogId: string) {
  if (!confirm('Bạn chắc chắn muốn xóa bài viết này?')) return;

  this.blogService.deleteBlog(blogId).subscribe({
    next: () => {
      // deleteBlog đã đẩy vào state, nhưng mình vẫn filter UI cho chắc
      this.blogs = this.blogs.filter(b => b.id !== blogId);
      this.filteredBlogs = this.filteredBlogs.filter(b => b.id !== blogId);
      this.notify.success('Bài viết đã được xóa thành công!');
    },
    error: (err) => {
      console.error(err);
      this.notify.error('Xóa bài viết thất bại');
    }
  });
  }

  onGoBack() {
    this.router.navigate(['/admin']);
  }

  onLogout() {
    this.authService.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}