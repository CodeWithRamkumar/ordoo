import { Component, OnInit, Input } from '@angular/core';
import { IonCard, IonCardContent, IonIcon, IonLabel, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calculator, musicalNotes, cloud } from 'ionicons/icons';
import { WorkspaceCard } from 'src/app/core/utils/work-space-card';

@Component({
  selector: 'app-workspace-cards',
  templateUrl: './workspace-cards.component.html',
  styleUrls: ['./workspace-cards.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardContent, IonIcon, IonLabel]
})
export class WorkspaceCardsComponent implements OnInit {

  @Input() cards: WorkspaceCard[] = [
    {
      icon: 'calculator',
      text: 'Calculator',
      subtext: '6 calculator tools',
      route: '/workspace/calculator-dashboard'
    },
    {
      icon: 'musical-notes',
      text: 'Music Player',
      subtext: 'Play your favorite music',
      route: '/workspace/music'
    },
    {
      icon: 'cloud',
      text: 'Weather',
      subtext: 'Check the weather',
      route: '/workspace/weather'
    }
  ];

  @Input() pageHeading: string = 'My Workspace';
  @Input() pageSubHeading: string = 'Access all your applications in one place';

  constructor(private navCtrl: NavController) {
      addIcons({ calculator, musicalNotes, cloud });
  }

  ngOnInit() {}

  navigateToRoute(route: string) {
    console.log(route);
    
    this.navCtrl.navigateRoot(route);
  }
}
