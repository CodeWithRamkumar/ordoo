import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { IonContent, IonButton, IonInput, IonItem, IonIcon, NavController, IonText } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { lockClosedOutline, eyeOutline, eyeOffOutline, arrowBackOutline, alertCircle, checkmarkCircle } from 'ionicons/icons';
import { ConfigService } from '../../../shared/services/config.service';
import { LoaderService } from '../../../shared/services/loader.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonInput, IonItem, IonIcon, IonText, CommonModule, ReactiveFormsModule]
})
export class ResetPasswordPage implements OnInit {
  resetPasswordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  token: string = '';
  tokenValid = true;
  passwordReset = false;

  constructor(
    private fb: FormBuilder, 
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private http: HttpClient,
    private config: ConfigService,
    private loader: LoaderService
  ) {
    addIcons({ lockClosedOutline, eyeOutline, eyeOffOutline, arrowBackOutline, alertCircle, checkmarkCircle });
    
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.tokenValid = false;
    } else {
      this.validateToken();
    }
  }

  async validateToken() {
    await this.loader.show('Validating reset link...');
    
    this.http.post(`${this.config.API_BASE_URL}/auth/validate-reset-token`, {
      token: this.token
    }).subscribe({
      next: async (response: any) => {
        await this.loader.hide();
        this.tokenValid = true;
      },
      error: async (error) => {
        await this.loader.hide();
        this.tokenValid = false;
      }
    });
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
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

  async onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      await this.loader.show('Resetting password...');
      
      this.http.post(`${this.config.API_BASE_URL}/auth/reset-password`, {
        token: this.token,
        newPassword: this.resetPasswordForm.value.password
      }).subscribe({
        next: async (response: any) => {
          await this.loader.hide();
          this.passwordReset = true;
        },
        error: async (error) => {
          await this.loader.hide();
          this.tokenValid = false;
        }
      });
    }
  }

  navigateToLogin() {
    this.navCtrl.navigateRoot('/auth/login');
  }
}
