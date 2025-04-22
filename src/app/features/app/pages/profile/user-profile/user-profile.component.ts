import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { SocialUser, Badge } from '../../../../../core/models/user.model';
import { SocialActivity, GastronomicRoute } from '../../../../../core/models/route.model';
import { CardComponent } from '../../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { RouteCardComponent } from '../../../../../shared/components/route-card/route-card.component';

/**
 * Componente para la vista de perfil de usuario
 * 
 * Muestra la información del usuario actual, su actividad,
 * estadísticas, rutas favoritas y logros.
 */
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    CardComponent,
    ButtonComponent,
    RouteCardComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  // Servicios
  private mockDataService = inject(MockDataService);
  
  // Datos
  user = signal<SocialUser | undefined>(undefined);
  activities = signal<SocialActivity[]>([]);
  recentBadges = signal<Badge[]>([]);
  myRoutes = signal<GastronomicRoute[]>([]);
  completedRoutes = signal<GastronomicRoute[]>([]);
  
  // Estados
  isLoadingUser = signal<boolean>(true);
  isLoadingActivities = signal<boolean>(true);
  isLoadingRoutes = signal<boolean>(true);
  error = signal<string | null>(null);
  activeTab = signal<'activity' | 'stats' | 'routes'>('activity');
  
  // En una app real, obtendríamos este ID del servicio de autenticación
  userId = 'user1';
  
  ngOnInit(): void {
    this.loadUserData();
    this.loadUserActivities();
    this.loadUserRoutes();
  }
  
  /**
   * Carga los datos del usuario
   */
  loadUserData(): void {
    this.isLoadingUser.set(true);
    
    this.mockDataService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user.set(user);
        
        // Obtener las insignias más recientes
        if (user?.passport?.badges) {
          const sortedBadges = [...user.passport.badges].sort((a, b) => {
            const dateA = a.dateEarned ? new Date(a.dateEarned).getTime() : 0;
            const dateB = b.dateEarned ? new Date(b.dateEarned).getTime() : 0;
            return dateB - dateA;
          });
          
          this.recentBadges.set(sortedBadges.slice(0, 3));
        }
        
        this.isLoadingUser.set(false);
      },
      error: (err) => {
        console.error('Error loading user data', err);
        this.error.set('Error al cargar los datos del perfil');
        this.isLoadingUser.set(false);
      }
    });
  }
  
  /**
   * Carga las actividades del usuario
   */
  loadUserActivities(): void {
    this.isLoadingActivities.set(true);
    
    this.mockDataService.getActivitiesByUser(this.userId).subscribe({
      next: (activities) => {
        this.activities.set(activities);
        this.isLoadingActivities.set(false);
      },
      error: (err) => {
        console.error('Error loading user activities', err);
        this.error.set('Error al cargar la actividad del usuario');
        this.isLoadingActivities.set(false);
      }
    });
  }
  
  /**
   * Carga las rutas del usuario
   */
  loadUserRoutes(): void {
    this.isLoadingRoutes.set(true);
    
    // Cargar rutas creadas
    this.mockDataService.getRoutesByUser(this.userId).subscribe({
      next: (routes) => {
        this.myRoutes.set(routes);
        
        // Cargar rutas completadas
        this.mockDataService.getCompletedRoutesByUser(this.userId).subscribe({
          next: (completedRoutes) => {
            this.completedRoutes.set(completedRoutes);
            this.isLoadingRoutes.set(false);
          },
          error: (err) => {
            console.error('Error loading completed routes', err);
            this.error.set('Error al cargar las rutas completadas');
            this.isLoadingRoutes.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error loading user routes', err);
        this.error.set('Error al cargar las rutas del usuario');
        this.isLoadingRoutes.set(false);
      }
    });
  }
  
  /**
   * Cambia la pestaña activa
   */
  setActiveTab(tab: 'activity' | 'stats' | 'routes'): void {
    this.activeTab.set(tab);
  }
  
  /**
   * Formatea una fecha en formato legible
   */
  formatDate(date: Date | string): string {
    const activityDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return activityDate.toLocaleDateString();
  }
  
  /**
   * Obtiene el texto para una actividad según su tipo
   */
  getActivityText(activity: SocialActivity): string {
    if (!activity) return '';
    
    switch (activity.type) {
      case 'rating':
        return `has valorado ${activity.targetName}`;
      case 'favorite':
        return `has marcado como favorito ${activity.targetName}`;
      case 'visit':
        return `has visitado ${activity.targetName}`;
      case 'route_completed':
        return `has completado la ruta ${activity.targetName}`;
      case 'route_created':
        return `has creado una nueva ruta: ${activity.targetName}`;
      case 'follow_restaurant':
        return `ahora sigues a ${activity.targetName}`;
      case 'follow_user':
        return `ahora sigues a ${activity.targetName}`;
      case 'badge_earned':
        return `has ganado la insignia ${activity.targetName}`;
      default:
        return 'has realizado una actividad';
    }
  }
}