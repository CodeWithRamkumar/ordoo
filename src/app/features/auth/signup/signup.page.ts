import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { IonContent, IonButton, IonInput, IonItem, IonIcon, NavController, IonText, ToastController } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, personOutline, logoGoogle, logoFacebook, logoApple, logoTwitter } from 'ionicons/icons';
import { AuthService } from '../../../shared/services/auth.service';
import { ConfigService } from '../../../shared/services/config.service';
import { LoaderService } from '../../../shared/services/loader.service';
import { FirebaseSsoService } from '../../../shared/services/firebase-sso.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonInput, IonItem, IonIcon, IonText, CommonModule, ReactiveFormsModule]
})
export class SignupPage implements OnInit {
  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  emailExists = false;

  constructor(private fb: FormBuilder, private navCtrl: NavController, private http: HttpClient, private authService: AuthService, private config: ConfigService, private loader: LoaderService, private firebaseSso: FirebaseSsoService, private toastController: ToastController) {
    addIcons({ eyeOutline, eyeOffOutline, mailOutline, lockClosedOutline, personOutline, logoGoogle, logoFacebook, logoApple, logoTwitter });
    
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {}

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value && confirmPassword.value && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onSignup(ssoData?: any) {
    console.log('onSignup called', { ssoData, formValid: this.signupForm.valid, formValue: this.signupForm.value });
    
    this.emailExists = false;
    
    let signupData;
    if (ssoData) {
      // SSO signup
      signupData = { ...ssoData, isSso: true };
    } else {
      // Regular signup
      if (!this.signupForm.valid) {
        console.log('Form is invalid:', this.signupForm.errors);
        return;
      }
      signupData = {
        email: this.signupForm.value.email,
        password: this.signupForm.value.password
      };
    }

    console.log('Making API call to:', this.config.AUTH.SIGNUP, 'with data:', signupData);
    
    try {
      const response = await this.http.post(this.config.AUTH.SIGNUP, signupData).toPromise();
      console.log('Signup success:', response);
      // await this.authService.saveUserData(response);
      this.navCtrl.navigateRoot('/auth/profile-setup');
    } catch (error) {
      console.log('Signup error:', error);
    }
  }

  navigateToLogin() {
    this.navCtrl.navigateRoot('/auth/login');
  }

  async signupWithGoogle() {
    try {
      const ssoData = await this.firebaseSso.signInWithGoogle();
      await this.onSignup(ssoData);
    } catch (error) {
      console.error('Google signup error:', error);
    }
  }

  async signupWithFacebook() {
    try {
      const ssoData = await this.firebaseSso.signInWithFacebook();
      await this.onSignup(ssoData);
    } catch (error) {
      console.error('Facebook signup error:', error);
    }
  }

  async signupWithApple() {
    try {
      const ssoData = await this.firebaseSso.signInWithApple();
      await this.onSignup(ssoData);
    } catch (error) {
      console.error('Apple signup error:', error);
    }
  }

  async signupWithTwitter() {
    try {
      const ssoData = await this.firebaseSso.signInWithTwitter();
      await this.onSignup(ssoData);
    } catch (error) {
      console.error('Twitter signup error:', error);
    }
  }

  clearEmailError() {
    if (this.emailExists) {
      this.emailExists = false;
      this.signupForm.get('email')?.setErrors(null);
    }
  }
}