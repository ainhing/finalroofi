import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-terms',
  standalone: false,
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
export class Terms {
  showScrollTop = false;

  @HostListener('window:scroll')
  onScroll() {
    this.showScrollTop = window.scrollY > 400;
  }

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
