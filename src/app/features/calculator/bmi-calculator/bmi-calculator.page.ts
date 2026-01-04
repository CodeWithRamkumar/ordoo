import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonInput, IonSelect, IonSelectOption, IonItem } from '@ionic/angular/standalone';
import { HeaderService } from 'src/app/shared/services/header.service';
import { addIcons } from 'ionicons';
import { fitness, close, informationCircleOutline, informationCircle, person, happy, warning } from 'ionicons/icons';


@Component({
  selector: 'app-bmi-calculator',
  templateUrl: './bmi-calculator.page.html',
  styleUrls: ['./bmi-calculator.page.scss'],
  standalone: true,
  imports: [IonContent, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonInput, IonSelect, IonSelectOption, IonItem, CommonModule, FormsModule]
})
export class BmiCalculatorPage implements OnInit {
  @ViewChild('categoriesModal') categoriesModal!: IonModal;
  @ViewChild('bmiResultContainer', { static: false }) bmiResultContainer!: ElementRef;
  weight!: number;
  height!: number;
  age!: number;
  gender: string = 'male';
  unit: string = 'metric'; // metric or imperial
  bmi: number = 0;
  category: string = '';
  categoryColor: string = '';

  bmiCategories = [
    { range: 'Below 18.5', category: 'Underweight', color: 'primary' },
    { range: '18.5 - 24.9', category: 'Normal weight', color: 'success' },
    { range: '25.0 - 29.9', category: 'Overweight', color: 'warning' },
    { range: '30.0 and above', category: 'Obese', color: 'danger' }
  ];

  constructor(private headerService: HeaderService) {
        addIcons({ fitness, close, informationCircleOutline, informationCircle, person, happy, warning });
   }

  ngOnInit() {}

  ionViewDidEnter() {
    this.headerService.updateHeaderData({
      title: 'BMI Calculator',
      subtitle: 'Click back to return',
      image: 'fitness',
      imageType: 'icon',
      showBack: true,
      showMenu: true,
      backNavigationUrl: '/workspace/calculator-dashboard'
    });
  }

  calculateBMI() {
    if (!this.weight || !this.height) return;

    let heightInMeters = this.height;
    let weightInKg = this.weight;

    if (this.unit === 'imperial') {
      // Convert feet to meters (height is in feet)
      heightInMeters = this.height * 0.3048;
      // Convert pounds to kg
      weightInKg = this.weight * 0.453592;
    } else {
      // Convert cm to meters
      heightInMeters = this.height / 100;
    }

    this.bmi = Number((weightInKg / (heightInMeters * heightInMeters)).toFixed(1));
    this.setBMICategory();
  }

  calculateBMIWithScroll() {
    this.calculateBMI();
    
    // Scroll to results on mobile
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        this.bmiResultContainer.nativeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }

  setBMICategory() {
    if (this.bmi < 18.5) {
      this.category = 'Underweight';
      this.categoryColor = 'primary';
    } else if (this.bmi < 25) {
      this.category = 'Normal weight';
      this.categoryColor = 'success';
    } else if (this.bmi < 30) {
      this.category = 'Overweight';
      this.categoryColor = 'warning';
    } else {
      this.category = 'Obese';
      this.categoryColor = 'danger';
    }
  }

  reset() {
    this.weight = undefined!;
    this.height = undefined!;
    this.age = undefined!;
    this.gender = 'male';
    this.bmi = 0;
    this.category = '';
    this.categoryColor = '';
  }

  openCategoriesModal() {
    this.categoriesModal.present();
  }

  getBMIDescription(): string {
    if (!this.category) return '';
    
    const descriptions: { [key: string]: string } = {
      'Underweight': 'Consider consulting a healthcare provider',
      'Normal weight': 'Maintain with balanced diet and exercise',
      'Overweight': 'Consider lifestyle changes',
      'Obese': 'Consult healthcare provider for guidance'
    };
    
    return descriptions[this.category] || '';
  }

  getBMIPosition(): number {
    if (!this.bmi) return 0;
    
    // Map BMI to percentage position on the range bar (0-100%)
    if (this.bmi < 18.5) {
      return Math.min((this.bmi / 18.5) * 25, 25);
    } else if (this.bmi < 25) {
      return 25 + ((this.bmi - 18.5) / (25 - 18.5)) * 25;
    } else if (this.bmi < 30) {
      return 50 + ((this.bmi - 25) / (30 - 25)) * 25;
    } else {
      return Math.min(75 + ((this.bmi - 30) / 10) * 25, 100);
    }
  }
}
