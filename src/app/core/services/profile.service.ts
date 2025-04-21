import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';

import { MockDataService } from './mock-data.service';
import { Restaurant } from '../models/restaurant.model';
import { SocialUser } from '../models/user.model';
import { SocialActivity } from '../models/route.model';

/**
 * Servicio para gestionar perfiles de restaurantes y usuarios
 * 
 * Utiliza signals para manejar el estado y proporciona métodos para
 * cargar y manipular perfiles.
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private mockDataService = inject(MockDataService);
  
  // Signals para estado
  private _currentRestaurant = signal<Restaurant | null>(null);
  private _currentUser = signal<SocialUser | null>(null);
  private _profileActivities = signal<SocialActivity[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _profileType = signal<'restaurant' | 'user' | null>(null);
  private _isFollowing = signal<boolean>(false);
  
  // Exposición de signals como readonly
  public currentRestaurant = this._currentRestaurant.asReadonly();
  public currentUser = this._currentUser.asReadonly();
  public profileActivities = this._profileActivities.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();
  public profileType = this._profileType.asReadonly();
  public isFollowing = this._isFollowing.asReadonly();
  
  // Señales computadas
  public currentProfileName = computed(() => {
    if (this._profileType() === 'restaurant') {
      return this._currentRestaurant()?.name || '';
    } else if (this._profileType() === 'user') {
      const user = this._currentUser();
      return user ? `${user.name} ${user.lastName || ''}` : '';
    }
    return '';
  });
  
  public currentProfileImage = computed(() => {
    if (this._profileType() === 'restaurant') {
      return this._currentRestaurant()?.logo || null;
    } else if (this._profileType() === 'user') {
      return this._currentUser()?.profileImage || null;
    }
    return null;
  });
  
  public currentProfileCover = computed(() => {
    if (this._profileType() === 'restaurant') {
      return this._currentRestaurant()?.coverImage || null;
    } else if (this._profileType() === 'user') {
      // Los usuarios también podrían tener imágenes de portada
      return this._currentUser()?.profileImage || null;
    }
    return null;
  });
  
  public currentProfileUsername = computed(() => {
    if (this._profileType() === 'restaurant') {
      return this._currentRestaurant()?.username || '';
    } else if (this._profileType() === 'user') {
      return this._currentUser()?.username || '';
    }
    return '';
  });
  
  public followers = computed(() => {
    if (this._profileType() === 'restaurant') {
      return this._currentRestaurant()?.followers || 0;
    } else if (this._profileType() === 'user') {
      return this._currentUser()?.followers || 0;
    }
    return 0;
  });
  
  /**
   * Carga un perfil por su nombre de usuario
   */
  loadProfileByUsername(username: string): void {
    this._loading.set(true);
    this._error.set(null);
    
    // Primero intentamos cargar como restaurante
    this.mockDataService.getRestaurantByUsername(username).subscribe(restaurant => {
      if (restaurant) {
        this._currentRestaurant.set(restaurant);
        this._currentUser.set(null);
        this._profileType.set('restaurant');
        this._loading.set(false);
        this.loadProfileActivities(restaurant.id!);
        this.checkFollowingStatus(restaurant.id!);
      } else {
        // Si no es restaurante, intentamos como usuario
        this.mockDataService.getUserByUsername(username).subscribe(user => {
          if (user) {
            this._currentUser.set(user);
            this._currentRestaurant.set(null);
            this._profileType.set('user');
            this._loading.set(false);
            this.loadProfileActivities(user.id!);
            this.checkFollowingStatus(user.id!);
          } else {
            // Si no se encuentra, establecemos error
            this._error.set('Perfil no encontrado');
            this._loading.set(false);
          }
        }, err => {
          console.error('Error loading user profile', err);
          this._error.set('Error al cargar el perfil de usuario');
          this._loading.set(false);
        });
      }
    }, err => {
      console.error('Error loading restaurant profile', err);
      this._error.set('Error al cargar el perfil de restaurante');
      this._loading.set(false);
    });
  }
  
  /**
   * Carga las actividades de un perfil
   */
  private loadProfileActivities(profileId: string): void {
    this.mockDataService.getActivitiesByUser(profileId).subscribe(activities => {
      this._profileActivities.set(activities);
    }, err => {
      console.error('Error loading profile activities', err);
      // No establecemos error general para no afectar la visualización del perfil
    });
  }
  
  /**
   * Verifica si el usuario actual sigue al perfil
   * En una app real, esto verificaría con el usuario autenticado
   */
  private checkFollowingStatus(profileId: string): void {
    // Simulamos un estado aleatorio para demo
    this._isFollowing.set(Math.random() > 0.5);
  }
  
  /**
   * Cambia el estado de seguimiento del perfil
   */
  toggleFollow(): Observable<boolean> {
    const currentStatus = this._isFollowing();
    const newStatus = !currentStatus;
    
    // Optimistic update
    this._isFollowing.set(newStatus);
    
    // Actualizamos el contador de seguidores
    if (this._profileType() === 'restaurant' && this._currentRestaurant()) {
      const restaurant = this._currentRestaurant()!;
      const updatedFollowers = (restaurant.followers || 0) + (newStatus ? 1 : -1);
      this._currentRestaurant.set({
        ...restaurant,
        followers: updatedFollowers >= 0 ? updatedFollowers : 0
      });
    } else if (this._profileType() === 'user' && this._currentUser()) {
      const user = this._currentUser()!;
      const updatedFollowers = (user.followers || 0) + (newStatus ? 1 : -1);
      this._currentUser.set({
        ...user,
        followers: updatedFollowers >= 0 ? updatedFollowers : 0
      });
    }
    
    // En una app real, esto sería una llamada a la API
    // Simulamos con un delay
    return of(newStatus).pipe(
      delay(800),
      catchError(err => {
        // En caso de error, revertimos el cambio
        this._isFollowing.set(currentStatus);
        console.error('Error toggling follow status', err);
        return of(currentStatus);
      })
    );
  }
  
  /**
   * Limpia el estado actual del perfil
   */
  clearProfile(): void {
    this._currentRestaurant.set(null);
    this._currentUser.set(null);
    this._profileActivities.set([]);
    this._profileType.set(null);
    this._error.set(null);
  }
}

// Función de utilidad para simular delay
function delay(ms: number) {
  return function<T>(observable: Observable<T>): Observable<T> {
    return new Observable<T>(observer => {
      const subscription = observable.subscribe({
        next(value) {
          setTimeout(() => observer.next(value), ms);
        },
        error(err) {
          setTimeout(() => observer.error(err), ms);
        },
        complete() {
          setTimeout(() => observer.complete(), ms);
        }
      });
      
      return () => subscription.unsubscribe();
    });
  };
}