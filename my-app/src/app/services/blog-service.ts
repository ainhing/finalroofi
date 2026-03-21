import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, shareReplay, catchError } from 'rxjs/operators';
import { Blog, BlogStateService } from './blogstateservice';


@Injectable({ providedIn: 'root' })
export class BlogService {
  private apiUrl = 'http://localhost:3003/blogs';

  // cache observable cho list (giống Productservice)
  private getBlogsCache$: Observable<Blog[]> | null = null;

  constructor(
    private http: HttpClient,
    private stateService: BlogStateService
  ) {}

  /** Normalize data từ backend (BlogId/Title/... hoặc id/title/...) */
  private normalizeBlog(raw: any): Blog {
    const id = raw?.BlogId || raw?.id || raw?._id || '';
    const tags =
      typeof raw?.Tags === 'string'
        ? raw.Tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : Array.isArray(raw?.Tags)
          ? raw.Tags
          : Array.isArray(raw?.tags)
            ? raw.tags
            : [];

    return {
      id,
      title: raw?.Title || raw?.title || '(Chưa đặt tiêu đề)',
      slug: raw?.Slug || raw?.slug || '',
      summary: raw?.Summary || raw?.summary || '',
      content: raw?.Content || raw?.content || '',
      author: raw?.Author || raw?.author || '',
      tags,
      coverImage: raw?.CoverImage || raw?.coverImage || '',
      isPublished: raw?.IsPublished ?? raw?.isPublished ?? false,
      createdAt: raw?.CreatedAt || raw?.createdAt || '',
      updatedAt: raw?.UpdatedAt || raw?.updatedAt || ''
    };
  }

  /** LIST blogs (có shareReplay + state) */
  getBlogs(forceReload = false): Observable<Blog[]> {
    if (!forceReload && this.getBlogsCache$) return this.getBlogsCache$;

    // Ưu tiên cache trong stateService trước
    const cached = this.stateService.getFromCache('all_blogs');
    if (!forceReload && cached) {
      this.getBlogsCache$ = of(cached).pipe(shareReplay(1));
      return this.getBlogsCache$;
    }

    this.getBlogsCache$ = this.http.get<any>(this.apiUrl).pipe(
      map(res => res?.data || res || []),
      map((rawArr: any[]) => (Array.isArray(rawArr) ? rawArr : []).map(r => this.normalizeBlog(r))),
      tap(list => this.stateService.setBlogs(list)),
      shareReplay(1),
      catchError(err => {
        console.error('Error fetching blogs', err);
        return of([] as Blog[]);
      })
    );

    return this.getBlogsCache$;
  }

  /** Find blog in current state list (nhanh như Product admin fix) */
  private findBlogInState(idOrSlug: string): Blog | undefined {
  const list = this.stateService.getBlogsSync();
  return list.find(b => b.id === idOrSlug || b.slug === idOrSlug);
}

  /** GET blog by id (ưu tiên cache/state trước, rồi mới gọi API) */
  getBlogById(id: string): Observable<Blog | undefined> {
  if (!id) return of(undefined);

  // 1️⃣ cache riêng
  const cached = this.stateService.getFromCache(`blog_${id}`);
  if (cached !== null) return of(cached);

  // 2️⃣ tìm trong list state (NHANH)
  const inState = this.findBlogInState(id);
  if (inState) {
    this.stateService.setSingleBlog(inState);
    return of(inState);
  }

  // 3️⃣ fallback API
  return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
    map(res => res?.blog || res?.data || res),
    map(raw => (raw ? this.normalizeBlog(raw) : undefined)),
    tap(blog => this.stateService.setSingleBlog(blog)),
    catchError(err => {
      console.error('Error fetching blog by id', err);
      return of(undefined);
    })
  );
}

  /** CREATE */
  createBlog(payload: any): Observable<any> {
    // clear list cache để reload
    this.getBlogsCache$ = null;
    this.stateService.clearCache('all_blogs');

    return this.http.post<any>(this.apiUrl, payload).pipe(
      tap((res) => {
        // nếu backend trả về blog vừa tạo thì add vào state luôn
        const raw = res?.blog || res?.data || res;
        if (raw) this.stateService.addBlog(this.normalizeBlog(raw));
      })
    );
  }

  /** UPDATE */
  updateBlog(id: string, payload: any): Observable<any> {
    this.getBlogsCache$ = null;
    this.stateService.clearCache('all_blogs');
    this.stateService.clearCache(`blog_${id}`);

    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((res) => {
        const raw = res?.blog || res?.data || payload;
        if (raw) this.stateService.updateBlog(this.normalizeBlog({ ...raw, BlogId: id, id }));
      })
    );
  }

  /** DELETE */
  deleteBlog(id: string): Observable<any> {
    this.getBlogsCache$ = null;
    this.stateService.clearCache('all_blogs');
    this.stateService.clearCache(`blog_${id}`);

    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.stateService.deleteBlog(id))
    );
  }
  uploadCoverImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  return this.http.post<any>('http://localhost:3003/upload', formData);
}

  /** Nếu bạn cần force refresh từ UI */
  clearListCache(): void {
    this.getBlogsCache$ = null;
    this.stateService.clearCache('all_blogs');
  }
}