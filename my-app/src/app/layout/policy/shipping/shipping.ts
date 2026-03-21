import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-shipping',
  standalone: false,
  templateUrl: './shipping.html',
  styleUrl: './shipping.css',
})
export class Shipping {
  showScrollTop = false;

@HostListener('window:scroll')
onScroll() {
  this.showScrollTop = window.scrollY > 400;
}

scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
}
