import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonRouterOutlet, IonContent, NavController } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { TabsComponent } from "src/app/shared/components/tabs/tabs.component";
import { HeaderService } from 'src/app/shared/services/header.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.page.html',
  styleUrls: ['./workspace.page.scss'],
  standalone: true,
  imports: [ IonRouterOutlet, CommonModule, FormsModule, HeaderComponent, IonContent, TabsComponent]
})
export class WorkspacePage implements OnInit, OnDestroy {

  headerData$ = this.headerService.headerData$;

  constructor(private headerService: HeaderService, private navCtrl: NavController) {}

  ngOnInit() {
    this.headerService.updateHeaderData({
      title: 'My Workspace',
      subtitle: 'Access all your applications', 
      image: 'assets/icon/ordoo-logo.svg',
      imageType:'image',
      showBack: false,
      showMenu: true,
      backNavigationUrl: ''
    });
  }

  ngOnDestroy() {
  }
}
