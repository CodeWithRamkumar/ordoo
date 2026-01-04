import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  readonly API_BASE_URL = this.isLocal ? 'http://localhost:3001/api' : 'https://your-server.com/api';
  
  // API Endpoints
  readonly AUTH = {
    LOGIN: `${this.API_BASE_URL}/auth/login`,
    SIGNUP: `${this.API_BASE_URL}/auth/signup`,
    LOGOUT: `${this.API_BASE_URL}/auth/logout`,
    PROFILE: `${this.API_BASE_URL}/user/profile`
  };

  readonly UPLOAD = {
    SINGLE: `${this.API_BASE_URL}/upload/single`,
    CHUNK: `${this.API_BASE_URL}/upload/chunk`
  };

  get isLocalEnvironment(): boolean {
    return this.isLocal;
  }
}