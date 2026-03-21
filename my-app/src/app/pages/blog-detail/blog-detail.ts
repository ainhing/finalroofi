import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { BLOG_POSTS, BlogPost } from '../../assets/data/blog-posts';
import { BlogService } from '../../services/blog-service';


@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.html',
})
export class BlogDetail implements OnInit {
  post: any;
  currentUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
  const param =
  this.route.snapshot.paramMap.get('slug') ||
  this.route.snapshot.paramMap.get('id');

if (!param) {
  console.error('Missing route param (slug/id)');
  return;
}

  this.currentUrl = encodeURIComponent(window.location.href);

  this.blogService.getBlogById(param).subscribe({
    next: (b: any) => {
      if (!b) { this.post = undefined; return; }

      this.post = {
        title: b.Title || b.title,
        description: b.Summary || b.summary,
        contentHtml: b.Content || b.content,
        headerImage: b.CoverImage || b.coverImage,
        date: b.CreatedAt ? new Date(b.CreatedAt).toLocaleDateString('vi-VN') : '',
        slug: b.Slug || b.slug
      };
    },
    error: (err: any) => {
      console.error(err);
      this.post = undefined;
    }
  });
}
}