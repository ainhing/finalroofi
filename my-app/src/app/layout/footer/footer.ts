import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
})
export class Footer {
  showScrollTop = false;

@HostListener('window:scroll')
onScroll() {
  this.showScrollTop = window.scrollY > 200;
}

scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
} 
