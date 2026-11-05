import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmBox } from './confirm-box';

describe('ConfirmBox', () => {
  let component: ConfirmBox;
  let fixture: ComponentFixture<ConfirmBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmBox],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmBox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
