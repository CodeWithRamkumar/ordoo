import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../shared/services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const navCtrl = inject(NavController);
  const authService = inject(AuthService);
  const token = await authService.getToken();

  // Allow access to public auth routes without token
  if (state.url.includes('/auth/login') || 
      state.url.includes('/auth/signup') || 
      state.url.includes('/auth/forgot-password') || 
      state.url.includes('/auth/reset-password')) {
    if (token && (state.url.includes('/auth/login') || state.url.includes('/auth/signup'))) {
      setTimeout(() => navCtrl.navigateRoot('/workspace'), 0);
      return false;
    }
    return true;
  }

  if (token) {
    return true;
  }
  
  navCtrl.navigateRoot('/auth/login');
  return false;
};