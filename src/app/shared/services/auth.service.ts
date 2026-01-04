import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage, private http: HttpClient, private configService: ConfigService) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async saveUserData(userData: any) {
    await this._storage?.set('user', userData.user);
    await this._storage?.set('profile', userData.profile);
    await this._storage?.set('token', userData.token);
  }

  async getUserData() {
    return {
      user: await this._storage?.get('user'),
      profile: await this._storage?.get('profile'),
      token: await this._storage?.get('token')
    };
  }

  async getToken() {
    return await this._storage?.get('token');
  }

  async clearUserData() {
    await this._storage?.remove('user');
    await this._storage?.remove('profile');
    await this._storage?.remove('token');
  }
}