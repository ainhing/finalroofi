import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adminordercheck } from './adminordercheck';

describe('Adminordercheck', () => {
  let component: Adminordercheck;
  let fixture: ComponentFixture<Adminordercheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Adminordercheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Adminordercheck);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
