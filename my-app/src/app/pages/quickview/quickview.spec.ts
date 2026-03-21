import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuickView } from './quickview';



describe('QuickView', () => {
  let component: QuickView;
  let fixture: ComponentFixture<QuickView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuickView]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

