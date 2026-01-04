import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalculatorDashboardPage } from './calculator-dashboard.page';

describe('CalculatorDashboardPage', () => {
  let component: CalculatorDashboardPage;
  let fixture: ComponentFixture<CalculatorDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatorDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
