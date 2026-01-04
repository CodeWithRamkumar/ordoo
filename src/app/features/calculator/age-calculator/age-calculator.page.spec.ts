import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgeCalculatorPage } from './age-calculator.page';

describe('AgeCalculatorPage', () => {
  let component: AgeCalculatorPage;
  let fixture: ComponentFixture<AgeCalculatorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgeCalculatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});