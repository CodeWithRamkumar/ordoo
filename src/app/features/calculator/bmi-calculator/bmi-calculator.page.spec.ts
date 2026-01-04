import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BmiCalculatorPage } from './bmi-calculator.page';

describe('BmiCalculatorPage', () => {
  let component: BmiCalculatorPage;
  let fixture: ComponentFixture<BmiCalculatorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BmiCalculatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
