import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { tap, finalize, map } from 'rxjs/operators';

import { MockDataService } from './mock-data.service';
import { Restaurant } from '../models/restaurant.model';
import { SocialUser } from '../models/user.model';
import { SocialActivity } from '../models/route.model';
import { RestaurantService } from './restaurant.service';
import { RestaurantAdapterService } from './restaurant-adapter.service';

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
  private restaurantService = inject(RestaurantService);
  private restaurantAdapter = inject(RestaurantAdapterService);
  // Signals para estado
  private _currentRestaurant = signal<Restaurant | null>(null);
  private _currentUser = signal<SocialUser | null>(null);
  private _profileActivities = signal<SocialActivity[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _profileType = signal<'restaurant' | 'user' | null>(null);
  private _isFollowing = signal<boolean>(false);
  
  // Nuevas signals para mejor gestión de estados
  private _dataLoaded = signal<boolean>(false);
  private _currentUsername = signal<string>('');
  private _lastLoadTime = signal<number>(0);
  
  // Exposición de signals como readonly
  public currentRestaurant = this._currentRestaurant.asReadonly();
  public currentUser = this._currentUser.asReadonly();
  public profileActivities = this._profileActivities.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();
  public profileType = this._profileType.asReadonly();
  public isFollowing = this._isFollowing.asReadonly();
  public dataLoaded = this._dataLoaded.asReadonly();
  public currentUsername = this._currentUsername.asReadonly();
  
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
 * Comprueba si es necesario cargar los datos del perfil
 * Solo los carga si es un nuevo perfil o si los datos no están ya cargados
 * @param username Nombre de usuario a cargar
 * @param forceReload Forzar recarga incluso si ya está en caché
 */
loadProfileByUsername(username: string, forceReload: boolean = false): void {
  // Si ya estamos cargando datos, evitamos una nueva petición
  if (this._loading()) {
    console.log('ProfileService: Ya hay una carga en progreso');
    return;
  }
  
  const currentTime = Date.now();
  const timeSinceLastLoad = currentTime - this._lastLoadTime();
  const isSameUser = this._currentUsername() === username;
  const cacheAge = 30000; // 30 segundos en ms
  
  // Si ya tenemos los datos cargados para este username, están frescos y no se fuerza la recarga
  if (this._dataLoaded() && isSameUser && !forceReload && timeSinceLastLoad < cacheAge) {
    console.log('ProfileService: Usando datos en caché para', username, 'edad:', timeSinceLastLoad, 'ms');
    return;
  }
  
  console.log('ProfileService: Cargando perfil para username:', username, 'forceReload:', forceReload);
  this._loading.set(true);
  this._error.set(null);
  this._currentUsername.set(username);
  
  // Limpiamos las actividades para prevenir que se muestren las del perfil anterior
  this._profileActivities.set([]);
  
  // Primero intentamos cargar como restaurante
  // this.mockDataService.getRestaurantByUsername(username)
  //   .pipe(
  //     catchError(err => {
  //       console.error('Error al cargar el perfil de restaurante', err);
  //       return of(undefined);
  //     })
  //   )
  //   .subscribe(restaurant => {
  //     if (restaurant) {
  //       console.log('ProfileService: Restaurante encontrado:', restaurant.name);
  //       this._currentRestaurant.set(restaurant);
  //       this._currentUser.set(null);
  //       this._profileType.set('restaurant');
  //       this._loading.set(false);
  //       this._dataLoaded.set(true);
  //       this._lastLoadTime.set(Date.now());
        
  //       // Cargar actividades explícitamente después de obtener el ID
  //       this.loadProfileActivities(restaurant.id!);
  //       this.checkFollowingStatus(restaurant.id!);
  //     } else {
  //       // Si no es restaurante, intentamos como usuario
  //       this.mockDataService.getUserByUsername(username)
  //         .pipe(
  //           catchError(err => {
  //             console.error('Error al cargar el perfil de usuario', err);
  //             this._error.set('Error al cargar el perfil');
  //             this._loading.set(false);
  //             return of(undefined);
  //           })
  //         )
  //         .subscribe(user => {
  //           if (user) {
  //             console.log('ProfileService: Usuario encontrado:', user.name);
  //             this._currentUser.set(user);
  //             this._currentRestaurant.set(null);
  //             this._profileType.set('user');
  //             this._loading.set(false);
  //             this._dataLoaded.set(true);
  //             this._lastLoadTime.set(Date.now());
              
  //             // Cargar actividades explícitamente después de obtener el ID
  //             this.loadProfileActivities(user.id!);
  //             this.checkFollowingStatus(user.id!);
  //           } else {
  //             // Si no se encuentra, establecemos error
  //             this._error.set('Perfil no encontrado');
  //             this._loading.set(false);
  //             this._dataLoaded.set(false);
  //           }
  //         });
  //     }
  //   });

  this.restaurantService.getRestaurantByUsername(username).subscribe({
    next: (restaurant) => {
      if (restaurant) {
        console.log('ProfileService: Restaurante encontrado:', restaurant.name);
        this._currentRestaurant.set(this.restaurantAdapter.adaptRestaurant(restaurant));
        this._currentUser.set(null);
        this._profileType.set('restaurant');
        this._loading.set(false);
        this._dataLoaded.set(true);
        this._lastLoadTime.set(Date.now());
        
        // Cargar actividades explícitamente después de obtener el ID
        this.loadProfileActivities(restaurant.id!);
        this.checkFollowingStatus(restaurant.id!);
      } else {
        // Si no es restaurante, intentamos como usuario
        this.mockDataService.getUserByUsername(username)
          .pipe(
            catchError(err => {
              console.error('Error al cargar el perfil de usuario', err);
              this._error.set('Error al cargar el perfil');
              this._loading.set(false);
              return of(undefined);
            })
          )
          .subscribe(user => {
            if (user) {
              console.log('ProfileService: Usuario encontrado:', user.name);
              this._currentUser.set(user);
              this._currentRestaurant.set(null);
              this._profileType.set('user');
              this._loading.set(false);
              this._dataLoaded.set(true);
              this._lastLoadTime.set(Date.now());
              
              // Cargar actividades explícitamente después de obtener el ID
              this.loadProfileActivities(user.id!);
              this.checkFollowingStatus(user.id!);
            } else {
              // Si no se encuentra, establecemos error
              this._error.set('Perfil no encontrado');
              this._loading.set(false);
              this._dataLoaded.set(false);
            }
          });
      }
    },
    error: (err) => {
      console.error('Error al cargar el perfil de restaurante', err);
      this._error.set('Error al cargar el perfil');
      this._loading.set(false);
    }
  })
}

  
  /**
   * Recarga el perfil actual (útil para actualizar datos después de cambios)
   */
  reloadCurrentProfile(): void {
    const username = this._currentUsername();
    if (username) {
      this.loadProfileByUsername(username, true);
    }
  }
  
 /**
 * Carga las actividades de un perfil
 * IMPORTANTE: Esta función ahora es pública para poder forzar la recarga
 */
loadProfileActivities(profileId: string): void {
  console.log('ProfileService: Cargando actividades para:', profileId);
  
  this.mockDataService.getActivitiesByUser(profileId)
    .pipe(
      catchError(err => {
        console.error('Error al cargar actividades del perfil', err);
        return of([]);
      })
    )
    .subscribe(activities => {
      console.log('ProfileService: Actividades cargadas:', activities.length);
      this._profileActivities.set(activities);
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
   * Limpia el estado parcialmente (para componentes que se desmontan)
   * No elimina datos del perfil principal para evitar parpadeos en la UI
   */
  clearProfile(): void {
    this._profileActivities.set([]);
    this._error.set(null);
    // No limpiamos el restaurante/usuario actual para evitar parpadeos
  }
  
  /**
   * Limpia completamente el estado (para cambios de perfil o logout)
   */
  resetProfile(): void {
    this._currentRestaurant.set(null);
    this._currentUser.set(null);
    this._profileActivities.set([]);
    this._profileType.set(null);
    this._error.set(null);
    this._dataLoaded.set(false);
    this._currentUsername.set('');
    this._lastLoadTime.set(0);
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