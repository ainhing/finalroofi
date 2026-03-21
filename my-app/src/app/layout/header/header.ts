import { ChangeDetectorRef, Component, HostListener, OnDestroy } from '@angular/core';
import { ProductSection, Productservice } from '../../services/productservice';
import { Cartservice } from '../../services/cartservice';
import { Authservice } from '../../services/authservice';
import { Notificationservice } from '../../services/notificationservice';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Voucher, Voucherservice } from '../../services/voucherservice';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
})
export class Header implements OnDestroy {
  mobileMenuOpen = false;
  mobileProductOpen = false;
  userMenuOpen = false;
  cartCount$: Observable<number>;
  private destroy$ = new Subject<void>(); 
  currentUser: any = null;
  isLoggedIn = false;
  savedVouchers: Voucher[] = [];
  savedSectionOpen = false;

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.mobileProductOpen = false;
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
    this.mobileProductOpen = false;
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.loadSavedVouchers();
    } else {
      this.savedSectionOpen = false;
    }
  }

  closeUserMenu() {
    this.userMenuOpen = false;
    this.savedSectionOpen = false;
  }
  
  showScrollTop = false;

  @HostListener('window:scroll')
  onScroll() {
    this.showScrollTop = window.scrollY > 400;
  }

  // Close user menu when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.closeUserMenu();
    }
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Toast notifications
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';
  timeoutId: any;

  constructor(
    private cartService: Cartservice,
    private authService: Authservice,
    private notifyService: Notificationservice,
    private voucherService: Voucherservice,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.cartCount$ = this.cartService.cartCount$;
    this.checkLoginStatus();

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
        if (this.isLoggedIn) {
          this.loadSavedVouchers();
        } else {
          this.savedVouchers = [];
          this.savedSectionOpen = false;
        }
      });
    
    // Listen to router events to update login status
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkLoginStatus();
    });
  }

  checkLoginStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.currentUser = this.authService.getCurrentUser();
      this.loadSavedVouchers();
    } else {
      this.currentUser = null;
      this.savedVouchers = [];
      this.savedSectionOpen = false;
    }
  }

  private loadSavedVouchers() {
    this.savedVouchers = this.voucherService.getSavedVouchers();
  }

  toggleSavedSection(event?: Event) {
    if (event) event.stopPropagation();
    this.savedSectionOpen = !this.savedSectionOpen;
    if (this.savedSectionOpen) {
      this.loadSavedVouchers();
    }
  }

  onLogout() {
    this.authService.logout();
    this.notifyService.success('Đăng xuất thành công!');
    this.isLoggedIn = false;
    this.currentUser = null;
    this.closeUserMenu();
    this.router.navigate(['/']);
  }

  addToCart(event: Event, product: any): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.add({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: 'S'
    });
    this.showToast(`Đã thêm nhanh: "${product.name}"`, 'success');
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = message;
    this.notificationType = type; 
    this.showNotification = true;
    this.cdr.detectChanges();
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.showNotification = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

} 
