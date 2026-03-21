import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Blog {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  author?: string;
  tags?: string[];
  coverImage?: string;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class BlogStateService {
  private blogsSubject = new BehaviorSubject<Blog[]>([]);
  private singleBlogSubject = new BehaviorSubject<Blog | undefined>(undefined);

  public blogs$ = this.blogsSubject.asObservable();
  public singleBlog$ = this.singleBlogSubject.asObservable();

  // Cache đơn giản giống ProductStateService
  private cache: { [key: string]: { data: any; timestamp: number } } = {};
  private cacheExpiry = 5 * 60 * 1000; // 5 phút

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

  clearCache(key?: string): void {
    if (key) delete this.cache[key];
    else this.cache = {};
  }

  setBlogs(blogs: Blog[]): void {
    this.blogsSubject.next(blogs);
    this.setCache('all_blogs', blogs);
  }

  setSingleBlog(blog: Blog | undefined): void {
    this.singleBlogSubject.next(blog);
    if (blog) this.setCache(`blog_${blog.id}`, blog);
  }

  updateBlog(blog: Blog): void {
    this.setSingleBlog(blog);
    const current = this.blogsSubject.value || [];
    const updated = current.map(b => (b.id === blog.id ? blog : b));
    this.setBlogs(updated);
  }

  addBlog(blog: Blog): void {
    const current = this.blogsSubject.value || [];
    this.setBlogs([blog, ...current]);
    this.setSingleBlog(blog);
  }

  deleteBlog(blogId: string): void {
    const current = this.blogsSubject.value || [];
    this.setBlogs(current.filter(b => b.id !== blogId));
    this.cache[`blog_${blogId}`] = { data: undefined, timestamp: Date.now() };
    if (this.singleBlogSubject.value?.id === blogId) {
      this.setSingleBlog(undefined);
    }
  }

  getBlogsSync(): Blog[] {
    return this.blogsSubject.value || [];
  }

  getSingleBlogSync(): Blog | undefined {
    return this.singleBlogSubject.value;
  }
}