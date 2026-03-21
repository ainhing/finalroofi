import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniCart } from './mini-cart';

describe('MiniCart', () => {
  let component: MiniCart;
  let fixture: ComponentFixture<MiniCart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiniCart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniCart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
