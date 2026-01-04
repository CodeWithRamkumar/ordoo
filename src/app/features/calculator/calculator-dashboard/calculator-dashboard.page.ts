import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderService } from 'src/app/shared/services/header.service';
import { WorkspaceCardsComponent } from "../../dashboard/workspace-cards/workspace-cards.component";
import { WorkspaceCard } from 'src/app/core/utils/work-space-card';
import { calculator, calendar, flask, fitness } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-calculator-dashboard',
  templateUrl: './calculator-dashboard.page.html',
  styleUrls: ['./calculator-dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, WorkspaceCardsComponent]
})
export class CalculatorDashboardPage implements OnInit {

  customCards: WorkspaceCard[] = [
      {
        icon: 'calculator',
        text: 'Basic Calculator',
        subtext: 'Standard arithmetic operations',
        route: '/workspace/calculator-dashboard/basic-calculator'
      },
      {
        icon: 'calendar',
        text: 'Age Calculator',
        subtext: 'Calculate your exact age',
        route: '/workspace/calculator-dashboard/age-calculator'
      },
      {
        icon: 'fitness',
        text: 'BMI Calculator',
        subtext: 'Calculate Body Mass Index',
        route: '/workspace/calculator-dashboard/bmi-calculator'
      }
    ];

    pageHeading: string = 'Choose a Calculator';
    pageSubHeading: string = 'Select from our collection of calculator tools';

  constructor(private headerService: HeaderService) { 
    addIcons({ calculator, calendar, flask, fitness });
  }

  ngOnInit() {
  }

  ionViewDidEnter() {
    console.log('Calculator ionViewDidEnter called');
    this.headerService.updateHeaderData({
      title: 'Calculators',
      subtitle: 'Click back to return',
      image: 'calculator',
      imageType:'icon',
      showBack: true,
      showMenu: true,
      backNavigationUrl: '/workspace'
    });
  }

}
