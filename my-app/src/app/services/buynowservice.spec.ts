import { TestBed } from '@angular/core/testing';

import { Buynowservice } from './buynowservice';

describe('Buynowservice', () => {
  let service: Buynowservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Buynowservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
