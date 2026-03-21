import { Component, ElementRef, Renderer2, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog-service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.html',
  styleUrls: ['./blog.css'],
  standalone: false,
})
export class Blog implements OnInit {
  sortOrder: string = 'newest';
  blogs: any[] = [];

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'auto' });

    this.blogService.getBlogs().subscribe(list => {
      // FIX: chỉ hiển thị bài viết đã xuất bản (isPublished = true)
      this.blogs = (list || []).filter(b => b.isPublished === true);
    });

    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdowns = this.el.nativeElement.querySelectorAll('.eco-dropdown');
    dropdowns.forEach((dropdown: HTMLElement) => {
      if (!dropdown.contains(target)) {
        dropdown.classList.remove('open');
      }
    });
  }

  scrollToBlogSection() {
    const blogSection = this.el.nativeElement.querySelector('#blog-section');
    if (blogSection) {
      blogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  updateSortLabel(label: string): void {
    const labelElement = this.el.nativeElement.querySelector('#sortLabel');
    if (labelElement) {
      labelElement.innerText = label;
    }
  }

  onSortChange(sortType: string) {
    this.sortOrder = sortType;
    const trackContainer = this.el.nativeElement.querySelector('#blogTrack > div');
    const track = this.el.nativeElement.querySelector('#blogTrack');
    const cards = Array.from(trackContainer.querySelectorAll('article')) as HTMLElement[];

    if (track) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    }

    cards.forEach((card: HTMLElement, index: number) => {
      let order = index;

      if (this.sortOrder === 'oldest') {
        order = cards.length - 1 - index;
      } else if (this.sortOrder === 'popular') {
        const popularOrder = [0, 1, 5, 2, 3, 4];
        order = popularOrder.indexOf(index);
        if (order === -1) order = index;
      }

      this.renderer.setStyle(card, 'order', order.toString());
    });
  }

  scrollLeft() {
    const track = this.el.nativeElement.querySelector('#blogTrack');
    if (track) {
      const cardWidth = track.querySelector('article')?.offsetWidth || 400;
      const gap = 32;
      track.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    }
  }

  scrollRight() {
    const track = this.el.nativeElement.querySelector('#blogTrack');
    if (track) {
      const cardWidth = track.querySelector('article')?.offsetWidth || 400;
      const gap = 32;
      track.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    }
  }
}