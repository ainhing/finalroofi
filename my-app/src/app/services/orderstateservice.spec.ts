import { TestBed } from '@angular/core/testing';

import { Orderstateservice } from './orderstateservice';

describe('Orderstateservice', () => {
  let service: Orderstateservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Orderstateservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
