import { TestBed } from '@angular/core/testing';

import { UserStateservice } from './user-stateservice';

describe('UserStateservice', () => {
  let service: UserStateservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserStateservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
