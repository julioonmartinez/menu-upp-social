import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ProfileService } from '../../../core/services/profile.service';
import { RestaurantProfileComponent } from '../pages/restaurant-profile/restaurant-profile.component';
import { UserProfileComponent } from '../pages/user-profile/user-profile.component';

/**
 * Componente cargador que determina qué tipo de perfil mostrar
 * 
 * Este componente actúa como un router condicional que carga
 * el componente correcto (RestaurantProfile o UserProfile)
 * basado en el tipo de perfil detectado.
 */
@Component({
  selector: 'app-profile-loader',
  standalone: true,
  imports: [
    CommonModule,
    RestaurantProfileComponent,
    UserProfileComponent
  ],
  template: `
    <!-- Estado de carga inicial -->
    <div class="profile-loader-state" *ngIf="loading && !profileType">
      <div class="loading-spinner">
        <i class="fa-solid fa-spinner fa-spin-pulse"></i>
      </div>
      <p>Cargando perfil...</p>
    </div>
    
    <!-- Componente de restaurante -->
    <app-restaurant-profile *ngIf="profileType === 'restaurant'"></app-restaurant-profile>
    
    <!-- Componente de usuario -->
    <app-user-profile *ngIf="profileType === 'user'"></app-user-profile>
    
    <!-- Estado de error - Solo mostrar si hay error y no hay un tipo de perfil -->
    <!-- <div class="error-state" *ngIf="showError">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <p>{{ errorMessage }}</p>
      <button class="return-button" (click)="navigateToExplore()">
        Volver a Explorar
      </button>
    </div> -->
  `,
  styles: [`
    .profile-loader-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
      text-align: center;
      color: rgba(30, 58, 138, 0.7);
    }
    
    .loading-spinner {
      font-size: 32px;
      color: #ff6b35;
      margin-bottom: 1rem;
    }
    
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 0;
      text-align: center;
      color: #1e3a8a;
    }
    
    .error-icon {
      font-size: 32px;
      color: #DC3545;
      margin-bottom: 1rem;
    }
    
    .return-button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background-color: #ff6b35;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .return-button:hover {
      background-color: #e05a2b;
    }
  `]
})
export class ProfileLoaderComponent implements OnInit, OnDestroy {
  // Servicios
  private profileService = inject(ProfileService);
  private router = inject(Router);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Signal computada para determinar si hay error y se debe mostrar
  showError = computed(() => {
    // Solo mostrar error si hay error, no estamos cargando y no hay un tipo de perfil
    return !!this.profileService.error() && 
           !this.profileService.loading() && 
           !this.profileService.profileType();
  });
  
  // Signal computada para obtener el mensaje de error
  errorMessage = computed(() => {
    return this.profileService.error() || 'Ha ocurrido un error al cargar el perfil';
  });
  
  ngOnInit(): void {
    // No necesitamos cargar el perfil explícitamente aquí
    // El layout ya se encarga de eso y solo necesitamos observar el tipo
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Navega a la página de exploración
   */
  navigateToExplore(): void {
    this.router.navigate(['/app/explore']);
  }
  
  // Getters para acceder al estado del ProfileService
  
  get profileType(): 'restaurant' | 'user' | null {
    return this.profileService.profileType();
  }
  
  get loading(): boolean {
    return this.profileService.loading();
  }
}