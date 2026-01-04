import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonMenuButton, IonItem, IonAvatar, IonImg, IonLabel } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menu, caretBack } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonMenuButton, IonItem, IonAvatar, IonImg, IonLabel, CommonModule]
})
export class HeaderComponent implements OnInit {

  @Input() headerTitle: string = '';
  @Input() headerSubtitle: string = '';
  @Input() headerImage: string = '';
  @Input() headerImageType: 'icon' | 'image' = 'icon';
  @Input() showBackButton: boolean = false;
  @Input() showMenuButton: boolean = false;
  @Input() backNavigationUrl: string = '';

  constructor(private navCtrl: NavController) {
    addIcons({ menu , caretBack});
  }

  ngOnInit() {
  }

  navigationBack() {
    this.navCtrl.navigateRoot(this.backNavigationUrl);
  }

}
