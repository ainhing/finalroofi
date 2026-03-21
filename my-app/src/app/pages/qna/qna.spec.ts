import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Qna } from './qna';

describe('Qna', () => {
  let component: Qna;
  let fixture: ComponentFixture<Qna>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Qna]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Qna);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
