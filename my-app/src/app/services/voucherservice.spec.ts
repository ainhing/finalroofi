import { TestBed } from '@angular/core/testing';

import { Voucherservice } from './voucherservice';

describe('Voucherservice', () => {
  let service: Voucherservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Voucherservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
