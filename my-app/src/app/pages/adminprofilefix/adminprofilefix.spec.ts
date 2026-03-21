import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Adminprofilefix } from './adminprofilefix';

describe('Adminprofilefix', () => {
  let component: Adminprofilefix;
  let fixture: ComponentFixture<Adminprofilefix>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Adminprofilefix]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Adminprofilefix);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
