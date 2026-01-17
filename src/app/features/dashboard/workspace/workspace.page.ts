import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonRouterOutlet, IonContent, NavController } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/shared/components/header/header.component";
import { TabsComponent } from "src/app/shared/components/tabs/tabs.component";
import { HeaderService } from 'src/app/shared/services/header.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.page.html',
  styleUrls: ['./workspace.page.scss'],
  standalone: true,
  imports: [ IonRouterOutlet, CommonModule, FormsModule, HeaderComponent, IonContent, TabsComponent]
})
export class WorkspacePage implements OnInit, OnDestroy {

  headerData$ = this.headerService.headerData$;
  private routerSubscription?: Subscription;

  constructor(private headerService: HeaderService, private navCtrl: NavController, private router: Router) {}

  ngOnInit() {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/workspace' || event.url === '/workspace/') {
        this.updateWorkspaceHeader();
      }
    });
    
    // Set header on initial load only if we're on workspace root
    if (this.router.url === '/workspace' || this.router.url === '/workspace/') {
      this.updateWorkspaceHeader();
    }
  }

  private updateWorkspaceHeader() {
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
    this.routerSubscription?.unsubscribe();
  }
}
