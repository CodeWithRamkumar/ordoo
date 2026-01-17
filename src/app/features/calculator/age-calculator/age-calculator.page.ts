import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonItem, IonIcon, AlertController } from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/shared/services/header.service';
import { addIcons } from 'ionicons';
import { calendar, informationCircleOutline } from 'ionicons/icons';

declare var $: any;

@Component({
  selector: 'app-age-calculator',
  templateUrl: './age-calculator.page.html',
  styleUrls: ['./age-calculator.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonItem, IonIcon, CommonModule, FormsModule]
})
export class AgeCalculatorPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('birthDateInput', { static: false }) birthDateInput!: ElementRef;
  @ViewChild('targetDateInput', { static: false }) targetDateInput!: ElementRef;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild('ageResultContainer', { static: false }) ageResultContainer!: ElementRef;
  
  birthDate: Date | null = null;
  targetDate: Date = new Date();
  
  years: number = 0;
  months: number = 0;
  days: number = 0;
  totalDays: number = 0;
  totalWeeks: number = 0;
  totalHours: number = 0;
  totalMinutes: number = 0;
  totalSeconds: number = 0;

  constructor(private headerService: HeaderService, private alertController: AlertController) {
    addIcons({ calendar, informationCircleOutline });
  }

  ngOnInit() {}

  private resizeListener = () => {
    setTimeout(() => {
      this.destroyDatepickers();
      this.initializeDatepickers();
    }, 100);
  };

  ngAfterViewInit() {
    this.initializeDatepickers();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    this.destroyDatepickers();
    window.removeEventListener('resize', this.resizeListener);
  }

  private initializeDatepickers() {
    $(this.birthDateInput.nativeElement).datepicker({
      format: 'M d, yyyy',
      autoclose: true,
      todayHighlight: true,
      minViewMode: 0,
      maxViewMode: 2,
      container: 'body',
      orientation: 'auto'
    }).on('changeDate', (e: any) => {
      this.birthDate = e.date;
    });
    
    $(this.targetDateInput.nativeElement).datepicker({
      format: 'M d, yyyy',
      autoclose: true,
      todayHighlight: true,
      minViewMode: 0,
      maxViewMode: 2,
      container: 'body',
      orientation: 'auto'
    }).on('changeDate', (e: any) => {
      this.targetDate = e.date;
    });
  }

  private destroyDatepickers() {
    $(this.birthDateInput.nativeElement).datepicker('destroy');
    $(this.targetDateInput.nativeElement).datepicker('destroy');
  }

  ionViewDidEnter() {
    this.headerService.updateHeaderData({
      title: 'Age Calculator',
      subtitle: 'Click back to return',
      image: 'calendar',
      imageType: 'icon',
      showBack: true,
      showMenu: true,
      backNavigationUrl: '/workspace/calculator-dashboard'
    });
  }

  async calculateAge() {
    if (!this.birthDate) return;

    const birth = new Date(this.birthDate);
    const target = new Date(this.targetDate);

    if (birth > target) {
      const alert = await this.alertController.create({
        header: 'Invalid Date',
        message: 'Birth date cannot be greater than the target date.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    this.years = years;
    this.months = months;
    this.days = days;

    const diffTime = target.getTime() - birth.getTime();
    this.totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    this.totalWeeks = Math.floor(this.totalDays / 7);
    this.totalHours = Math.floor(diffTime / (1000 * 60 * 60));
    this.totalMinutes = Math.floor(diffTime / (1000 * 60));
    this.totalSeconds = Math.floor(diffTime / 1000);

    // Scroll to results on mobile
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        this.ageResultContainer.nativeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }

  reset() {
    this.birthDate = null;
    this.targetDate = new Date();
    this.years = 0;
    this.months = 0;
    this.days = 0;
    this.totalDays = 0;
    this.totalWeeks = 0;
    this.totalHours = 0;
    this.totalMinutes = 0;
    this.totalSeconds = 0;
  }
}