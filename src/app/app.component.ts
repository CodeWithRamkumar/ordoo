import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { MenuComponent } from './shared/components/menu/menu.component';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet,MenuComponent],
})
export class AppComponent implements OnInit {
  constructor() {
  }

  async ngOnInit() {
    // No splash screen handling needed
  }
}
