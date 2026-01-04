import { Component, OnInit } from '@angular/core';
import { IonTabBar, IonTabButton, IonIcon, IonLabel, NavController } from '@ionic/angular/standalone';
import { home, person, search } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: true,
  imports: [IonTabBar, IonTabButton, IonIcon, IonLabel, CommonModule]
})
export class TabsComponent implements OnInit {

  constructor(private navCtrl: NavController) {
    addIcons({ home, person, search });
  }

  ngOnInit() {}

  navigate(route: string) {
    this.navCtrl.navigateRoot(route);
  }

  isActive(route: string): boolean {
    return window.location.pathname === route;
  }

}
