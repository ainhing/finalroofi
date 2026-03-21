import { TestBed } from '@angular/core/testing';

import { Blogstateservice } from './blogstateservice';

describe('Blogstateservice', () => {
  let service: Blogstateservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Blogstateservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
