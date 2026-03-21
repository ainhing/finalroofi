import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.html',
})
export class About implements OnInit {
  ngOnInit(): void {
    // Scroll to top when component loads
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}