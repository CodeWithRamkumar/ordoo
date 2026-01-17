import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../shared/services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const navCtrl = inject(NavController);
  const authService = inject(AuthService);
  
  try {
    // Ensure storage is initialized
    await authService.init();
    const token = await authService.getToken();
    
    console.log('Auth Guard - Token:', !!token, 'URL:', state.url);

    // Allow access to public auth routes without token
    if (state.url.includes('/auth/login') || 
        state.url.includes('/auth/signup') || 
        state.url.includes('/auth/forgot-password') || 
        state.url.includes('/auth/reset-password')) {
      if (token && (state.url.includes('/auth/login') || state.url.includes('/auth/signup'))) {
        console.log('Auth Guard - Redirecting authenticated user to workspace');
        navCtrl.navigateRoot('/workspace');
        return false;
      }
      return true;
    }

    if (token) {
      console.log('Auth Guard - User authenticated, allowing access');
      return true;
    }
    
    console.log('Auth Guard - No token, redirecting to login');
    navCtrl.navigateRoot('/auth/login');
    return false;
  } catch (error) {
    console.error('Auth Guard - Error:', error);
    navCtrl.navigateRoot('/auth/login');
    return false;
  }
};