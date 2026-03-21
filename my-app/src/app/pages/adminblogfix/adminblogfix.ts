import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { BlogService } from './../../services/blog-service';
import { BlogStateService } from '../../services/blogstateservice';

@Component({
  selector: 'app-adminblogfix',
  standalone: false,
  templateUrl: './adminblogfix.html',
  styleUrl: './adminblogfix.css',
})
export class Adminblogfix implements OnInit {
  // FIX: khai báo base URL backend ở 1 chỗ, dùng lại ở upload
  private readonly BACKEND_URL = 'http://localhost:3003';

  blogId: string = '';
  blog: any = null;

  isLoading   = true;
  isSaving    = false;
  isDeleting  = false;
  // FIX: thêm flag isUploading để disable button khi đang upload
  isUploading = false;

  selectedFile: File | null = null;
  user: any = null;
  tagInput = '';

  constructor(
    private route:       ActivatedRoute,
    private router:      Router,
    private blogService: BlogService,
    private blogState:   BlogStateService,
    private authService: Authservice,
    private notify:      Notificationservice,
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user || this.user.role !== 'admin') {
      this.notify.error('Bạn không có quyền truy cập trang này!');
      this.router.navigate(['/']);
      return;
    }

    this.route.params.subscribe(params => {
      this.blogId = params['id'];

      if (this.blogId === 'new') {
        this.blog = {
          BlogId:      this.generateBlogId(),
          Title:       '',
          Slug:        '',
          Summary:     '',
          Content:     '',
          Author:      this.user?.displayName || this.user?.name || this.user?.email || 'ROOFI',
          Tags:        [],
          CoverImage:  '',
          IsPublished: false,
        };
        this.isLoading = false;
        return;
      }

      if (this.blogId) this.loadBlogDetails();
    });
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadBlogDetails() {
    this.isLoading = false;

    if (!this.blog) {
      this.blog = {
        BlogId: '', Title: '', Slug: '', Summary: '', Content: '',
        Author: this.user?.email || 'ROOFI',
        Tags: [], CoverImage: '', IsPublished: false,
      };
    }

    const list  = this.blogState.getBlogsSync();
    const found = (list || []).find((b: any) =>
      b.BlogId === this.blogId || b.Slug === this.blogId ||
      b.id === this.blogId     || b.slug === this.blogId
    );

    if (found) { this.blog = this.prepareBlog(found); return; }

    this.blogService.getBlogById(this.blogId).subscribe({
      next: (blog: any) => {
        if (blog) this.blog = this.prepareBlog(blog);
        else { this.notify.error('Blog không tồn tại'); this.router.navigate(['/admin/blogs']); }
      },
      error: () => {
        this.notify.error('Không thể tải chi tiết blog');
        this.router.navigate(['/admin/blogs']);
      }
    });
  }

  private prepareBlog(raw: any): any {
    const b = { ...raw };

    if (!b.BlogId && b.blogId) b.BlogId = b.blogId;
    if (!b.Title && b.title)   b.Title  = b.title;
    if (!b.Slug && b.slug)     b.Slug   = b.slug;
    if (!b.Summary && b.summary)   b.Summary   = b.summary;
    if (!b.Content && b.content)   b.Content   = b.content;
    if (!b.Author && b.author)     b.Author    = b.author;
    if (!b.CoverImage && b.coverImage) b.CoverImage = b.coverImage;

    if (typeof b.Tags === 'string') {
      b.Tags = b.Tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    } else if (!Array.isArray(b.Tags)) {
      b.Tags = [];
    }

    if (b.IsPublished === undefined) b.IsPublished = b.isPublished ?? false;
    if (!b.BlogId && b.id)  b.BlogId = b.id;
    if (!b.BlogId && b._id) b.BlogId = b._id;

    return b;
  }

  // ── Slug ──────────────────────────────────────────────────────────────────

  generateSlug() {
    if (!this.blog) return;
    this.blog.Slug = (this.blog.Title || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // ── Tags ──────────────────────────────────────────────────────────────────

  addTag() {
    const tag = this.tagInput.trim();
    if (tag && this.blog && !this.blog.Tags.includes(tag)) this.blog.Tags.push(tag);
    this.tagInput = '';
  }

  onTagKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); this.addTag(); }
  }

  removeTag(index: number) { this.blog?.Tags.splice(index, 1); }

  // ── Image upload ──────────────────────────────────────────────────────────

  onFileChange(event: any) {
    this.selectedFile = event.target?.files?.[0] || null;
  }

  uploadCoverImage() {
    if (!this.selectedFile) {
      this.notify.error('Vui lòng chọn file trước');
      return;
    }

    this.isUploading = true;

    this.blogService.uploadCoverImage(this.selectedFile).subscribe({
      next: (res: any) => {
        if (res?.path && this.blog) {
          // FIX: path trả về là "assets/roofiimages/Images/xxx.jpg" (relative).
          // Angular app chạy ở localhost:4200 sẽ tìm ảnh ở localhost:4200/assets/...
          // nhưng file được lưu trên backend (localhost:3003) → ảnh không hiện.
          // Giải pháp: prefix bằng BACKEND_URL để img src là absolute URL.
          const rawPath: string = res.path;
          this.blog.CoverImage = rawPath.startsWith('http')
            ? rawPath                                      // đã là URL đầy đủ
            : `${this.BACKEND_URL}/${rawPath.replace(/^\//, '')}`; // ghép domain

          this.notify.success('Upload ảnh bìa thành công');
          this.selectedFile = null;
        } else {
          this.notify.error('Upload thất bại: backend không trả về đường dẫn');
        }
        this.isUploading = false;
      },
      error: (err: any) => {
        console.error('uploadCoverImage error:', err);
        this.notify.error('Upload ảnh bìa thất bại: ' + (err?.error?.error || err?.message || 'Lỗi không xác định'));
        this.isUploading = false;
      }
    });
  }

  removeCoverImage() {
    if (this.blog) this.blog.CoverImage = '';
    this.selectedFile = null;
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  saveBlog() {
    if (!this.blog?.Title?.trim()) {
      this.notify.error('Vui lòng nhập tiêu đề blog'); return;
    }
    if (!this.blog?.Content?.trim()) {
      this.notify.error('Vui lòng nhập nội dung blog'); return;
    }

    if (!this.blog.Slug?.trim()) this.generateSlug();

    this.isSaving = true;

    const payload = {
      BlogId:      this.blog.BlogId,
      Title:       this.blog.Title.trim(),
      Slug:        this.blog.Slug.trim(),
      Summary:     (this.blog.Summary || '').trim(),
      Content:     this.blog.Content,
      Author:      (this.blog.Author || 'ROOFI').trim(),
      Tags:        Array.isArray(this.blog.Tags) ? this.blog.Tags : [],
      CoverImage:  this.blog.CoverImage || '',
      IsPublished: !!this.blog.IsPublished,
    };

    if (this.blogId === 'new') {
      this.blogService.createBlog(payload).subscribe({
        next:  () => { this.notify.success('Tạo blog mới thành công'); this.isSaving = false; this.router.navigate(['/admin/blogs']); },
        error: (err: any) => { this.notify.error('Tạo blog thất bại: ' + (err?.error?.error || err?.message)); this.isSaving = false; }
      });
    } else {
      this.blogService.updateBlog(this.blogId, payload).subscribe({
        next:  () => { this.notify.success('Cập nhật blog thành công'); this.isSaving = false; this.router.navigate(['/admin/blogs']); },
        error: (err: any) => { this.notify.error('Cập nhật blog thất bại: ' + (err?.error?.error || err?.message)); this.isSaving = false; }
      });
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  deleteBlog() {
    if (!this.blog?.BlogId) { this.notify.error('Không thể xóa blog chưa được tạo'); return; }
    if (!confirm('Bạn chắc chắn muốn xóa blog này?')) return;

    this.isDeleting = true;
    this.blogService.deleteBlog(this.blog.BlogId).subscribe({
      next:  () => { this.notify.success('Blog đã được xóa'); this.isDeleting = false; this.router.navigate(['/admin/blogs']); },
      error: (err: any) => { this.notify.error('Xóa blog thất bại'); console.error(err); this.isDeleting = false; }
    });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  goBack() { this.router.navigate(['/admin/blogs']); }

  onLogout() {
    this.authService.logout();
    this.notify.success('Đăng xuất thành công!');
    this.router.navigate(['/']);
  }

  private generateBlogId(): string {
    return `BLOG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}