import { Component, OnInit, OnDestroy, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ProfileService } from '../../../../core/services/profile.service';
import { RoutesService } from '../../../../core/services/routes.service'; 
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SocialActivity } from '../../../../core/models/route.model';
import { RouteCardComponent } from '../../../../shared/components/route-card/route-card.component';
import { DishCardComponent } from '../../../../shared/components/dish-card/dish-card.component';
import { GastronomicRoute } from '../../../../core/models/route.model'; 

/**
 * Componente para mostrar el perfil público de un usuario
 * 
 * Muestra la actividad reciente del usuario, sus estadísticas
 * y otras informaciones relevantes de su perfil social.
 */
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    RouteCardComponent,
    DishCardComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  // Servicios
  private profileService = inject(ProfileService);
  private routesService = inject(RoutesService); 
  private route = inject(ActivatedRoute);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Estados usando signals
  private _activities = signal<SocialActivity[]>([]);
  loadingFollow = false;
  
  // Variables para rutas
  createdRoutes: GastronomicRoute[] = [];
  loadingRoutes = false;
  
  // Getter para acceder al valor de activities desde el template
  get activities(): SocialActivity[] {
    return this._activities();
  }
  
  constructor() {
    // Effect para reaccionar a cambios en las actividades
    effect(() => {
      // Cada vez que se actualice profileActivities(), 
      // actualizaremos nuestra variable local
      const activities = this.profileService.profileActivities();
      // Importante: Verificamos si hay cambios para evitar actualizaciones infinitas
      if (JSON.stringify(this._activities()) !== JSON.stringify(activities)) {
        this._activities.set(activities);
        console.log('Actividades actualizadas:', activities.length);
      }
    });
    
    // Effect para reaccionar a los cambios en las rutas
    effect(() => {
      // Cada vez que cambie routes() se ejecutará este código
      this.createdRoutes = this.routesService.routes();
      this.loadingRoutes = this.routesService.loading();
    });
    
    // Effect para reaccionar a cambios en el usuario actual
    effect(() => {
      const userId = this.userId;
      const isLoaded = this.profileService.dataLoaded();
      
      // Si tenemos un ID de usuario y los datos están cargados, cargamos las rutas
      if (userId && isLoaded && !this.loadingRoutes) {
        this.loadUserRoutes();
      }
    });
  }
  
  ngOnInit(): void {
    // Verificar si necesitamos cargar el perfil
    if (!this.profileService.dataLoaded()) {
      this.route.parent?.params.pipe(
        takeUntil(this.destroy$)
      ).subscribe(params => {
        const username = params['username'];
        if (username) {
          this.profileService.loadProfileByUsername(username);
        }
      });
    }
  }
  
  /**
   * Carga las rutas creadas por el usuario
   */
  loadUserRoutes(): void {
    if (!this.userId) return;
    
    // Cargar rutas usando el servicio
    console.log('Cargando rutas para usuario:', this.userId);
    this.routesService.loadRoutesByUser(this.userId);
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Maneja seguir/dejar de seguir al usuario
   */
  onFollowClick(): void {
    this.loadingFollow = true;
    
    this.profileService.toggleFollow().subscribe({
      next: () => {
        this.loadingFollow = false;
      },
      error: () => {
        this.loadingFollow = false;
      }
    });
  }
  
  /**
   * Maneja compartir el perfil
   */
  onShareClick(): void {
    console.log('Compartir perfil:', this.username);
    
    // En una app real, aquí usaríamos la API de compartir
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.userName,
        text: `Visita el perfil de ${this.userName} en MenuUPP`,
        url: url,
      })
      .catch((error) => console.log('Error compartiendo:', error));
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(url);
    }
  }
  
  /**
   * Obtiene el enlace adecuado según el tipo de actividad
   */
  getActivityTargetLink(activity: SocialActivity): string[] {
    switch (activity.type) {
      case 'rating':
      case 'favorite':
      case 'visit':
        // Asumimos que es un plato o restaurante
        if (activity.data?.dishId) {
          return ['/profile', activity.data.restaurantId, 'dish', activity.data.dishId];
        } else {
          return ['/profile', activity.targetId || ''];
        }
      
      case 'route_completed':
      case 'route_started':
      case 'route_progress':
      case 'route_created':
        return ['/app/routes', activity.targetId || ''];
      
      case 'follow_restaurant':
        return ['/profile', activity.targetId || ''];
      
      case 'follow_user':
        return ['/profile', activity.targetId || ''];
      
      case 'badge_earned':
        return ['/app/passport'];
      
      default:
        return ['/app/explore'];
    }
  }
  
  /**
   * Formatea el tipo de actividad para mostrar
   */
  formatActivityType(type: string): string {
    const types: Record<string, string> = {
      'rating': 'valoró',
      'favorite': 'marcó como favorito',
      'visit': 'visitó',
      'route_completed': 'completó la ruta',
      'route_started': 'comenzó la ruta',
      'route_progress': 'avanzó en la ruta',
      'route_created': 'creó una ruta',
      'follow_restaurant': 'sigue a',
      'follow_user': 'sigue a',
      'badge_earned': 'ganó la insignia'
    };
    
    return types[type] || type;
  }
  
  /**
   * Formatea la fecha de una actividad
   */
  formatActivityDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const activityDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - activityDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      // Menos de un día
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) {
        // Menos de una hora
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `hace ${diffMinutes} min`;
      }
      return `hace ${diffHours} h`;
    } else if (diffDays < 7) {
      // Menos de una semana
      return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else if (diffDays < 30) {
      // Menos de un mes
      const diffWeeks = Math.floor(diffDays / 7);
      return `hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
    } else {
      // Más de un mes, mostramos la fecha completa
      return activityDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
  
  // Getters para acceder al estado
  
  get user() {
    return this.profileService.currentUser();
  }
  
  get userId(): string {
    return this.user?.id || '';
  }
  
  get userName(): string {
    const user = this.user;
    return user ? `${user.name} ${user.lastName || ''}` : '';
  }
  
  get username(): string {
    return this.profileService.currentProfileUsername();
  }
  
  get userImage() {
    return this.profileService.currentProfileImage();
  }
  
  get userFollowers(): number {
    return this.profileService.followers();
  }
  
  get userFollowing(): number {
    return this.user?.following || 0;
  }
  
  get userBio(): string {
    return this.user?.bio || '';
  }
  
  get userLocation(): string {
    return this.user?.location || '';
  }
  
  get isFollowing(): boolean {
    return this.profileService.isFollowing();
  }
  
  get userPassport() {
    return this.user?.passport;
  }
  
  get loading(): boolean {
    return this.profileService.loading();
  }
  
  get error(): string | null {
    return this.profileService.error();
  }
  
  get isUser(): boolean {
    return this.profileService.profileType() === 'user';
  }
}