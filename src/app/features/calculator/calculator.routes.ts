import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./calculator-dashboard/calculator-dashboard.page').then(m => m.CalculatorDashboardPage)
  },
  {
    path: 'basic-calculator',
    loadComponent: () => import('./basic-calculator/basic-calculator.page').then(m => m.BasicCalculatorPage)
  },
  {
    path: 'bmi-calculator',
    loadComponent: () => import('./bmi-calculator/bmi-calculator.page').then(m => m.BmiCalculatorPage)
  },
  {
    path: 'age-calculator',
    loadComponent: () => import('./age-calculator/age-calculator.page').then(m => m.AgeCalculatorPage)
  }
];
