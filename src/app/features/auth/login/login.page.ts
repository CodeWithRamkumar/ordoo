import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonButton, IonInput, IonItem, IonIcon, NavController, IonText, IonModal, ToastController } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, checkmarkCircle, phonePortraitOutline, logoGoogle, logoFacebook, logoApple, logoTwitter } from 'ionicons/icons';
import { LoginWithOtpPage } from '../login-with-otp/login-with-otp.page';
import { AuthService } from '../../../shared/services/auth.service';
import { ConfigService } from '../../../shared/services/config.service';
import { LoaderService } from '../../../shared/services/loader.service';
import { FirebaseSsoService } from '../../../shared/services/firebase-sso.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonInput, IonItem, IonIcon, IonText, IonModal, CommonModule, ReactiveFormsModule, LoginWithOtpPage]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isOtpModalOpen = false;
  emailNotExists = false;
  passwordInvalid = false;
  currentEmail = '';

  constructor(private fb: FormBuilder, private navCtrl: NavController, private http: HttpClient, private authService: AuthService, private config: ConfigService, private loader: LoaderService, private firebaseSso: FirebaseSsoService, private toastController: ToastController) {
    addIcons({ eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, checkmarkCircle, phonePortraitOutline, logoGoogle, logoFacebook, logoApple, logoTwitter });
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onLogin(ssoData?: any) {
    this.emailNotExists = false;
    this.passwordInvalid = false;
    
    let loginData;
    if (ssoData) {
      // SSO login
      loginData = { ...ssoData, isSso: true };
    } else {
      // Regular login
      if (!this.loginForm.valid) return;
      loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
    }

    await this.loader.show('Logging in...');
    
    this.http.post(this.config.AUTH.LOGIN, loginData)
      .subscribe({
        next: async (response: any) => {
          console.log('Login response:', response);
          await this.authService.saveUserData(response);
          console.log('User data saved, navigating to workspace');
          await this.loader.hide();
          this.navCtrl.navigateRoot('/workspace');
        },
        error: async (error) => {
          await this.loader.hide();
          if (ssoData) {
            // Show toast for SSO errors
            let message = 'Login failed';
            if (error.status === 404) {
              message = 'User not found. Please sign up first.';
            } else if (error.status === 401) {
              message = 'Authentication failed';
            }
            const toast = await this.toastController.create({
              message,
              duration: 3000,
              color: 'danger',
              position: 'top'
            });
            await toast.present();
          } else {
            // Show form errors for regular login
            if (error.status === 404) {
              this.emailNotExists = true;
              this.loginForm.get('email')?.setErrors({ serverError: true });
            } else if (error.status === 401) {
              this.passwordInvalid = true;
              this.loginForm.get('password')?.setErrors({ serverError: true });
            }
          }
        }
      });
  }

  navigateToSignup() {
    this.navCtrl.navigateRoot('/auth/signup');
  }

  navigateToForgotPassword() {
    this.navCtrl.navigateRoot('/auth/forgot-password');
  }

  async loginWithGoogle() {
    try {
      const ssoData = await this.firebaseSso.signInWithGoogle();
      await this.onLogin(ssoData);
    } catch (error) {
      console.error('Google login error:', error);
    }
  }

  async loginWithFacebook() {
    try {
      const ssoData = await this.firebaseSso.signInWithFacebook();
      await this.onLogin(ssoData);
    } catch (error) {
      console.error('Facebook login error:', error);
    }
  }

  async loginWithApple() {
    try {
      const ssoData = await this.firebaseSso.signInWithApple();
      await this.onLogin(ssoData);
    } catch (error) {
      console.error('Apple login error:', error);
    }
  }

  async loginWithTwitter() {
    try {
      const ssoData = await this.firebaseSso.signInWithTwitter();
      await this.onLogin(ssoData);
    } catch (error) {
      console.error('Twitter login error:', error);
    }
  }

  async loginWithOTP() {
    // Validate email first
    const email = this.loginForm.get('email')?.value;
    if (!email || this.loginForm.get('email')?.invalid) {
      this.loginForm.get('email')?.markAsTouched();
      return;
    }

    await this.loader.show('Sending OTP...');
    
    // Send OTP API call
    this.http.post(`${this.config.API_BASE_URL}/auth/send-otp`, { email })
      .subscribe({
        next: async (response: any) => {
          await this.loader.hide();
          this.currentEmail = email;
          this.isOtpModalOpen = true;
        },
        error: async (error) => {
          await this.loader.hide();
          if (error.status === 404) {
            this.emailNotExists = true;
            this.loginForm.get('email')?.setErrors({ serverError: true });
          }
        }
      });
  }

  closeOtpModal() {
    this.isOtpModalOpen = false;
  }

  clearEmailError() {
    if (this.emailNotExists) {
      this.emailNotExists = false;
      this.loginForm.get('email')?.setErrors(null);
    }
  }

  clearPasswordError() {
    if (this.passwordInvalid) {
      this.passwordInvalid = false;
      this.loginForm.get('password')?.setErrors(null);
    }
  }

}
