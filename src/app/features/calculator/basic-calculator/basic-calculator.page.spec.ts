import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasicCalculatorPage } from './basic-calculator.page';

describe('BasicCalculatorPage', () => {
  let component: BasicCalculatorPage;
  let fixture: ComponentFixture<BasicCalculatorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicCalculatorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
