import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonInputOtp, IonIcon, NavController, IonText } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { close, shieldCheckmarkOutline } from 'ionicons/icons';
import { ConfigService } from '../../../shared/services/config.service';
import { LoaderService } from '../../../shared/services/loader.service';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-login-with-otp',
  templateUrl: './login-with-otp.page.html',
  styleUrls: ['./login-with-otp.page.scss'],
  standalone: true,
  imports: [IonButton, IonInputOtp, IonIcon, IonText, CommonModule, ReactiveFormsModule]
})
export class LoginWithOtpPage implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() email: string = '';
  
  otpForm: FormGroup;
  otpError = false;
  otpLength = 0;

  constructor(
    private fb: FormBuilder, 
    private navCtrl: NavController, 
    private http: HttpClient,
    private config: ConfigService,
    private loader: LoaderService,
    private authService: AuthService
  ) {
    addIcons({ close, shieldCheckmarkOutline });
    
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  async verifyOTP() {
    this.otpError = false;
    
    if (this.otpForm.valid) {
      await this.loader.show('Verifying OTP...');
      
      this.http.post(`${this.config.API_BASE_URL}/auth/verify-otp`, {
        email: this.email,
        otp: this.otpForm.value.otp
      }).subscribe({
        next: async (response: any) => {
          await this.authService.saveUserData(response);
          await this.loader.hide();
          this.close.emit();
          this.navCtrl.navigateRoot('/workspace');
        },
        error: async (error) => {
          await this.loader.hide();
          this.otpError = true;
          // Don't set form control error to avoid showing both messages
        }
      });
    }
  }

  clearOtpError() {
    if (this.otpError) {
      this.otpError = false;
      this.otpForm.get('otp')?.setErrors(null);
    }
  }

  onOtpChange(event: any) {
    this.clearOtpError();
    this.otpLength = event.detail.value?.length || 0;
  }

  async resendOTP() {
    await this.loader.show('Resending OTP...');
    
    this.http.post(`${this.config.API_BASE_URL}/auth/send-otp`, {
      email: this.email
    }).subscribe({
      next: async (response: any) => {
        await this.loader.hide();
        // Clear the OTP input
        this.otpForm.reset();
        this.otpError = false;
      },
      error: async (error) => {
        await this.loader.hide();
        console.error('Resend OTP error:', error);
      }
    });
  }
}