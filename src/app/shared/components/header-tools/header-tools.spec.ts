import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderTools } from './header-tools';

describe('HeaderTools', () => {
  let component: HeaderTools;
  let fixture: ComponentFixture<HeaderTools>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderTools],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderTools);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
