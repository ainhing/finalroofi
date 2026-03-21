import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-countdown-timer',
  standalone: false,
  template: `
    <div #timerElement class="countdown-display">
      <div class="countdown-unit" *ngIf="!expired">
        <span class="countdown-number">{{ pad(days) }}</span>
        <span class="countdown-label">Ngày</span>
      </div>
      <div class="countdown-separator" *ngIf="!expired">:</div>
      <div class="countdown-unit" *ngIf="!expired">
        <span class="countdown-number">{{ pad(hours) }}</span>
        <span class="countdown-label">Giờ</span>
      </div>
      <div class="countdown-separator" *ngIf="!expired">:</div>
      <div class="countdown-unit" *ngIf="!expired">
        <span class="countdown-number">{{ pad(minutes) }}</span>
        <span class="countdown-label">Phút</span>
      </div>
      <div class="countdown-separator" *ngIf="!expired">:</div>
      <div class="countdown-unit" *ngIf="!expired">
        <span class="countdown-number">{{ pad(seconds) }}</span>
        <span class="countdown-label">Giây</span>
      </div>
      <span class="expired" *ngIf="expired">🔥 Đã hết hạn!</span>
    </div>
  `,
  styles: [`
    .countdown-display {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
    }
    
    .countdown-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--beige, #f5f5dc);
      padding: 10px 15px;
      border-radius: 8px;
      min-width: 60px;
    }
    
    .countdown-number {
      font-size: 24px;
      font-weight: 700;
      color: var(--eco-green, #4caf50);
      line-height: 1;
    }
    
    .countdown-label {
      font-size: 11px;
      color: #666;
      margin-top: 5px;
      text-transform: uppercase;
    }
    
    .countdown-separator {
      font-size: 24px;
      font-weight: 700;
      color: var(--eco-green, #4caf50);
    }
    
    .expired {
      color: #d32f2f;
      font-weight: 600;
      font-size: 16px;
    }
    
    @media (max-width: 750px) {
      .countdown-unit {
        padding: 8px 10px;
        min-width: 50px;
      }
      
      .countdown-number {
        font-size: 20px;
      }
      
      .countdown-label {
        font-size: 10px;
      }
    }
  `]
})
export class CountdownTimer implements OnInit, OnDestroy {
  @Input() endTime!: string; // Format: "2026-01-01T00:00:00Z"
  
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  expired = false;
  
  private interval: any = null;
  
  ngOnInit() {
    if (this.endTime) {
      this.start();
    }
  }
  
  ngOnDestroy() {
    this.stop();
  }
  
  start() {
    this.update();
    this.interval = setInterval(() => this.update(), 1000);
  }
  
  update() {
    const endTime = new Date(this.endTime).getTime();
    const now = new Date().getTime();
    const distance = endTime - now;
    
    if (distance < 0) {
      this.expired = true;
      this.stop();
      return;
    }
    
    this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }
  
  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
