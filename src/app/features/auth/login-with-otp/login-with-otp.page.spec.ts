import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginWithOtpPage } from './login-with-otp.page';

describe('LoginWithOtpPage', () => {
  let component: LoginWithOtpPage;
  let fixture: ComponentFixture<LoginWithOtpPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginWithOtpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
