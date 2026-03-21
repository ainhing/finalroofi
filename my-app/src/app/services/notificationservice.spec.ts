import { TestBed } from '@angular/core/testing';

import { Notificationservice } from './notificationservice';

describe('Notificationservice', () => {
  let service: Notificationservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Notificationservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show notification', () => {
    spyOn(service, 'show');
    service.success('Test message');
    expect(service.show).toHaveBeenCalledWith('Test message', 'success', undefined);
  });

  it('should show error notification', () => {
    spyOn(service, 'show');
    service.error('Error message');
    expect(service.show).toHaveBeenCalledWith('Error message', 'error', undefined);
  });

  it('should show warning notification', () => {
    spyOn(service, 'show');
    service.warning('Warning message');
    expect(service.show).toHaveBeenCalledWith('Warning message', 'warning', undefined);
  });

  it('should show info notification', () => {
    spyOn(service, 'show');
    service.info('Info message');
    expect(service.show).toHaveBeenCalledWith('Info message', 'info', undefined);
  });
});
