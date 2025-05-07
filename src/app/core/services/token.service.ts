import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly tokenKey = 'auth_token';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  removeToken(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}