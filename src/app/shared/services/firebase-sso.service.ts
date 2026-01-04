import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, OAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { LoaderService } from './loader.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseSsoService {
  constructor(
    private auth: Auth,
    private authService: AuthService,
    private loaderService: LoaderService
  ) {}

  async signInWithGoogle(): Promise<any> {
    this.loaderService.show();
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return await this.handleSsoResult(result, 'google');
    } catch (error) {
      this.loaderService.hide();
      throw error;
    }
  }

  async signInWithFacebook(): Promise<any> {
    this.loaderService.show();
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return await this.handleSsoResult(result, 'facebook');
    } catch (error) {
      this.loaderService.hide();
      throw error;
    }
  }

  async signInWithApple(): Promise<any> {
    this.loaderService.show();
    try {
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(this.auth, provider);
      return await this.handleSsoResult(result, 'apple');
    } catch (error) {
      this.loaderService.hide();
      throw error;
    }
  }

  async signInWithTwitter(): Promise<any> {
    this.loaderService.show();
    try {
      const provider = new TwitterAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return await this.handleSsoResult(result, 'twitter');
    } catch (error) {
      this.loaderService.hide();
      throw error;
    }
  }

  private async handleSsoResult(result: UserCredential, providerName: string): Promise<any> {
    const user = result.user;
    this.loaderService.hide();
    return {
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      provider: providerName,
      uid: user.uid
    };
  }
}