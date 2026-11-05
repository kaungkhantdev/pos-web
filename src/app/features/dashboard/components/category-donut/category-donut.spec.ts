import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryDonut } from './category-donut';

describe('CategoryDonut', () => {
  let component: CategoryDonut;
  let fixture: ComponentFixture<CategoryDonut>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryDonut],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryDonut);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
