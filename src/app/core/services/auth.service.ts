import { Injectable, inject, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './api.service';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { TokenService } from './token.service';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'owner' | 'admin';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private isBrowser: boolean;
  
  // Signals para estado reactivo
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Token de acceso
  private tokenKey = 'auth_token';

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private tokenService: TokenService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.checkAuthentication();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.loading.set(true);
    
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return this.apiService.postFormData<AuthResponse>('/auth/token', formData).pipe(
      tap(response => {
        this.saveToken(response.access_token);
        this.isAuthenticated.set(true);
        this.loading.set(false);
        this.error.set(null);
        this.loadUserProfile();
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.error?.detail || 'Error de autenticación');
        return throwError(() => error);
      })
    );
  }

  register(user: any): Observable<User> {
    this.loading.set(true);
    return this.apiService.post<User>('/auth/register', user).pipe(
      tap(response => {
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.error?.detail || 'Error al registrarse');
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private checkAuthentication(): void {
    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);
      this.loadUserProfile();
    }
  }

  loadUserProfile(): Observable<User | null> {
    if (!this.getToken()) {
      return of(null);
    }

    return this.apiService.get<User>('/users/me').pipe(
      tap(user => {
        this.currentUser.set(user);
      }),
      catchError(error => {
        if (this.isBrowser) {
          this.logout();
        }
        return of(null);
      })
    );
  }
}