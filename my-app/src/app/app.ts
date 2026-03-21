import { Component, OnInit, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html'
})
export class App implements OnInit {
  protected readonly title = signal('my-app');
  isAdminRoute = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Smooth scroll for anchor links
    this.initSmoothScroll();
    
    // Handle route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Check if current route is admin
        this.isAdminRoute = event.url.includes('/admin');
        
        // Scroll to top when route changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Re-init smooth scroll after route change
        setTimeout(() => this.initSmoothScroll(), 100);
      });
  }

  // ========================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================
  private initSmoothScroll() {
    // Get all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        const href = (anchor as HTMLAnchorElement).getAttribute('href');
        
        // Bỏ qua nếu chỉ là "#"
        if (href === '#' || !href) return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          const header = document.getElementById('header');
          const headerHeight = header ? header.offsetHeight : 0;
          const targetPosition = (target as HTMLElement).offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Đóng mobile menu nếu đang mở
          const headerNav = document.querySelector('.header-nav');
          const menuIcon = document.querySelector('.header-bar-icon i');
          if (headerNav && headerNav.classList.contains('active')) {
            headerNav.classList.remove('active');
            if (menuIcon) {
              menuIcon.classList.remove('ri-close-line');
              menuIcon.classList.add('ri-menu-line');
            }
          }
        }
      });
    });
  }
}
