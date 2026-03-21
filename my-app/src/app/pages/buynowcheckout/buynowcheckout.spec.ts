import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Buynowcheckout } from './buynowcheckout';

describe('Buynowcheckout', () => {
  let component: Buynowcheckout;
  let fixture: ComponentFixture<Buynowcheckout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Buynowcheckout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Buynowcheckout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
