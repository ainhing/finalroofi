import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-privacy',
  standalone: false,
  templateUrl: './privacy.html',
  styleUrl: './privacy.css',
})
export class Privacy {
  showScrollTop = false;

@HostListener('window:scroll')
onScroll() {
  this.showScrollTop = window.scrollY > 400;
}

scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
}
