import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import {  IonInput, 
  IonItem, IonIcon, IonText, IonAvatar, IonSelect, IonSelectOption,
  IonTextarea,
  IonContent,
  IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personOutline, callOutline,
  cameraOutline, calendarOutline, 
  checkmarkCircle
} from 'ionicons/icons';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';
import { LoaderService } from '../../../shared/services/loader.service';

declare var $: any;

@Component({
  selector: 'app-profile-setup',
  templateUrl: './profile-setup.page.html',
  styleUrls: ['./profile-setup.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonButton, IonInput,
    IonItem, IonIcon, IonText, IonAvatar, IonSelect, IonSelectOption,
    IonTextarea, CommonModule, ReactiveFormsModule
  ]
})
export class ProfileSetupPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dateOfBirthInput', { static: false }) dateOfBirthInput!: ElementRef;
  
  profileForm: FormGroup;
  selectedImageUrl: string = '';
  selectedFile: File | null = null;
  dateOfBirth: Date | null = null;
  isDateFocused: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private cloudinaryService: CloudinaryService,
    private loader: LoaderService
  ) {
    addIcons({
      personOutline, callOutline, cameraOutline, calendarOutline, checkmarkCircle
    });

    this.profileForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      bio: ['', [Validators.required,Validators.maxLength(500)]]
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeDatepicker();
    }, 100);
  }

  ngOnDestroy() {
    this.destroyDatepicker();
  }

  private initializeDatepicker() {
    $(this.dateOfBirthInput.nativeElement).datepicker({
      format: 'mm/dd/yyyy',
      autoclose: true,
      todayHighlight: true,
      minViewMode: 0,
      maxViewMode: 2,
      container: 'body',
      orientation: 'auto'
    }).on('changeDate', (e: any) => {
      this.dateOfBirth = e.date;
      this.profileForm.patchValue({ dateOfBirth: e.date });
      this.profileForm.get('dateOfBirth')?.markAsTouched();
    });
  }

  private destroyDatepicker() {
    $(this.dateOfBirthInput.nativeElement).datepicker('destroy');
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerImageUpload() {
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    fileInput?.click();
  }

  async onSubmit() {
    this.profileForm.markAllAsTouched();
    
    if (this.profileForm.valid) {
      await this.loader.show('Setting up profile...');
      
      if (this.selectedFile) {
        this.cloudinaryService.uploadLargeFile(this.selectedFile).subscribe({
          next: (result) => {
            if (result.type === 4 && result.body) {
              this.updateProfile(result.body.public_id);
            }
          },
          error: async (error) => {
            await this.loader.hide();
            console.error('Upload failed:', error);
          }
        });
      } else {
        this.updateProfile('');
      }
    }
  }

  private async updateProfile(publicId: string) {
    const profileData = {
      ...this.profileForm.value,
      profileImage: publicId
    };
    
    this.cloudinaryService.updateProfile(profileData).subscribe({
      next: async (response) => {
        console.log('Profile updated:', response);
        await this.loader.hide();
        this.navCtrl.navigateRoot('/workspace');
      },
      error: async (error) => {
        await this.loader.hide();
        console.error('Profile update failed:', error);
      }
    });
  }

  onPhoneInput(event: any) {
    const value = event.target.value.replace(/[^0-9]/g, '');
    const maskedValue = this.formatPhoneNumber(value);
    this.profileForm.patchValue({ phone: maskedValue });
  }

  formatPhoneNumber(value: string): string {
    if (!value) return '';
    
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }

  skipSetup() {
    this.navCtrl.navigateRoot('/workspace');
  }

  onDateBlur() {
    this.isDateFocused = false;
    this.profileForm.get('dateOfBirth')?.markAsTouched();
  }

  // Validation state getters for date input
  get isDateTouched(): boolean {
    return this.profileForm.get('dateOfBirth')?.touched || false;
  }

  get isDateInvalid(): boolean {
    return this.profileForm.get('dateOfBirth')?.invalid || false;
  }

  get isDateValid(): boolean {
    return this.profileForm.get('dateOfBirth')?.valid || false;
  }
}
