import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonButton, IonInput, IonItem, IonIcon, NavController, IonText } from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { mailOutline, arrowBackOutline, checkmarkCircle } from 'ionicons/icons';
import { ConfigService } from '../../../shared/services/config.service';
import { LoaderService } from '../../../shared/services/loader.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonInput, IonItem, IonIcon, IonText, CommonModule, ReactiveFormsModule]
})
export class ForgotPasswordPage implements OnInit {
  forgotPasswordForm: FormGroup;
  emailNotFound = false;
  emailSent = false;

  constructor(
    private fb: FormBuilder, 
    private navCtrl: NavController,
    private http: HttpClient,
    private config: ConfigService,
    private loader: LoaderService
  ) {
    addIcons({ mailOutline, arrowBackOutline, checkmarkCircle });
    
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {}

  async onSubmit() {
    this.emailNotFound = false;
    
    if (this.forgotPasswordForm.valid) {
      await this.loader.show('Sending reset link...');
      
      this.http.post(`${this.config.API_BASE_URL}/auth/forgot-password`, {
        email: this.forgotPasswordForm.value.email
      }).subscribe({
        next: async (response: any) => {
          await this.loader.hide();
          this.emailSent = true;
        },
        error: async (error) => {
          await this.loader.hide();
          if (error.status === 404) {
            this.emailNotFound = true;
            this.forgotPasswordForm.get('email')?.setErrors({ serverError: true });
          }
        }
      });
    }
  }

  clearEmailError() {
    if (this.emailNotFound) {
      this.emailNotFound = false;
      this.forgotPasswordForm.get('email')?.setErrors(null);
    }
  }

  navigateToLogin() {
    this.navCtrl.navigateRoot('/auth/login');
  }
}
