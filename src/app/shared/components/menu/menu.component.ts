import { Component, OnInit } from '@angular/core';
import { IonMenu, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonIcon, IonLabel, IonAvatar, IonImg, MenuController, NavController } from '@ionic/angular/standalone';
import { home, person, logOut, search, calculator, copy, personSharp } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../services/config.service';
import { LoaderService } from '../../services/loader.service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [IonImg, IonAvatar, IonMenu, IonHeader, IonToolbar, IonContent, IonList, IonItem, IonIcon, IonLabel]
})
export class MenuComponent implements OnInit {
  userProfile = {
    name: 'Loading...',
    email: 'Loading...',
    image: 'assets/icon/ordoo-logo.svg'
  };
  showCopied = false;

  constructor(private menuCtrl: MenuController, private navCtrl: NavController, private authService: AuthService, private http: HttpClient, private config: ConfigService, private loader: LoaderService) {
    addIcons({ home, person, search, logOut, calculator , copy, personSharp});
  }

  async ngOnInit() {
    // Ensure storage is initialized
    await this.authService.init();
    await this.loadUserProfile();
  }

  async loadUserProfile() {
    const userData = await this.authService.getUserData();
    console.log('Menu - User data:', userData);
    
    if (userData.user) {
      this.userProfile = {
        name: userData.profile?.full_name || userData.user.email || 'User',
        email: userData.user.email || 'No email',
        image: userData.profile?.avatar_url || 'assets/icon/ordoo-logo.svg'
      };
      console.log('Menu - Updated profile:', this.userProfile);
    } else {
      console.log('Menu - No user data found');
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
    await this.loader.show('Logging out...');
    
    try {
      // Call logout API
      await this.http.post(this.config.AUTH.LOGOUT, {}).toPromise();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local data regardless of API response
      await this.authService.clearUserData();
      await this.loader.hide();
      this.navCtrl.navigateRoot('/auth/login');
     
    }
  }

  navigateTo(route: string) {
    this.navCtrl.navigateRoot(route);
    this.closeMenu();
  }

  isActive(route: string): boolean {
    return window.location.pathname === route;
  }

}
