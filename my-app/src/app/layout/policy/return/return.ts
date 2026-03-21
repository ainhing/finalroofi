import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-return',
  standalone: false,
  templateUrl: './return.html',
  styleUrl: './return.css',
})
export class Return {
  showScrollTop = false;

@HostListener('window:scroll')
onScroll() {
  this.showScrollTop = window.scrollY > 400;
}

scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
}
