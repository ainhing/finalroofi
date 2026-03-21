import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';

import { Newsletterservice } from './newsletterservice';
import { Notificationservice } from './notificationservice';

describe('Newsletterservice', () => {
  let service: Newsletterservice;
  let notifyService: Notificationservice;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Notificationservice]
    });
    service = TestBed.inject(Newsletterservice);
    notifyService = TestBed.inject(Notificationservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should validate email correctly', () => {
    expect(service.validateEmail('test@example.com')).toBe(true);
    expect(service.validateEmail('invalid-email')).toBe(false);
    expect(service.validateEmail('test@')).toBe(false);
    expect(service.validateEmail('@example.com')).toBe(false);
  });

  it('should subscribe to newsletter', fakeAsync(() => {
    const email = 'test@example.com';
    let result: any;
    
    service.subscribe(email).subscribe({
      next: (data) => {
        result = data;
      }
    });
    
    tick(1000); // Advance time by 1000ms to complete the delay
    
    expect(result).toBeTruthy();
    expect(result.success).toBe(true);
  }));
});
