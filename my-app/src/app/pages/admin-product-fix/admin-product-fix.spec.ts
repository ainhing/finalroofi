import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductFix } from './admin-product-fix';

describe('AdminProductFix', () => {
  let component: AdminProductFix;
  let fixture: ComponentFixture<AdminProductFix>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminProductFix]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductFix);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
