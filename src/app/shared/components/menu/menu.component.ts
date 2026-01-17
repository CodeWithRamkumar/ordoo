import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonMenu, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonIcon, IonLabel, IonAvatar, IonImg, MenuController, NavController } from '@ionic/angular/standalone';
import { home, person, logOut, search, calculator, copy, personSharp, time } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { AuthService } from '../../services/auth.service';
import { LogoutService } from '../../services/logout.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';
import { LoaderService } from '../../services/loader.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [IonImg, IonAvatar, IonMenu, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonIcon, IonLabel]
})
export class MenuComponent implements OnInit, OnDestroy {
  userProfile = {
    name: 'Loading...',
    email: 'Loading...',
    image: 'assets/icon/ordoo-logo.svg'
  };
  showCopied = false;
  private userDataSubscription?: Subscription;

  constructor(private menuCtrl: MenuController, private navCtrl: NavController, private authService: AuthService, private logoutService: LogoutService, private http: HttpClient, private config: ConfigService, private loader: LoaderService) {
    addIcons({ home, person, search, logOut, calculator , copy, personSharp, time});
  }

  async ngOnInit() {
    // Ensure storage is initialized
    await this.authService.init();
    await this.loadUserProfile();
    
    // Subscribe to user data changes
    this.userDataSubscription = this.authService.userDataChanged.subscribe(() => {
      this.loadUserProfile();
    });
  }

  ngOnDestroy() {
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
    }
  }

  async loadUserProfile() {
    try {
      await this.authService.init(); // Ensure storage is ready
      const userData = await this.authService.getUserData();
      console.log('Menu - User data:', userData);
      
      if (userData && userData.user) {
        this.userProfile = {
          name: userData.profile?.full_name || userData.user.email || 'User',
          email: userData.user.email || 'No email',
          image: userData.profile?.avatar_url || 'assets/icon/default-avatar.svg'
        };
        console.log('Menu - Updated profile:', this.userProfile);
      } else {
        console.log('Menu - No user data found, using defaults');
        this.userProfile = {
          name: 'Guest User',
          email: 'guest@example.com',
          image: 'assets/icon/ordoo-logo.svg'
        };
      }
    } catch (error) {
      console.error('Menu - Error loading user profile:', error);
      this.userProfile = {
        name: 'Error Loading',
        email: 'error@example.com',
        image: 'assets/icon/ordoo-logo.svg'
      };
    }
  }

  async updateUserProfile() {
    await this.loadUserProfile();
  }

  async copyEmail() {
    try {
      await navigator.clipboard.writeText(this.userProfile.email);
      this.showCopied = true;
      setTimeout(() => this.showCopied = false, 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  }

  closeMenu() {
    this.menuCtrl.close('main-menu');
  }

  async logout() {
    this.closeMenu();
    await this.logoutService.logout();
  }

  navigateTo(route: string) {
    this.navCtrl.navigateRoot(route);
    this.closeMenu();
  }

  isActive(route: string): boolean {
    const currentPath = window.location.hash.replace('#', '') || window.location.pathname;
    return currentPath === route;
  }

}
