import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adminblogfix } from './adminblogfix';

describe('Adminblogfix', () => {
  let component: Adminblogfix;
  let fixture: ComponentFixture<Adminblogfix>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Adminblogfix]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Adminblogfix);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
