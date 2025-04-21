import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { SocialActivity } from '../../../../core/models/route.model';
import { Restaurant } from '../../../../core/models/restaurant.model';
import { Dish } from '../../../../core/models/dish.model';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

/**
 * Página de exploración/feed social
 * 
 * Muestra un feed de actividades recientes, restaurantes y platos destacados.
 */
@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  // Servicios
  private mockDataService = inject(MockDataService);
  
  // Datos
  activities: SocialActivity[] = [];
  trendingRestaurants: Restaurant[] = [];
  popularDishes: Dish[] = [];
  
  // Estados
  isLoadingActivities = true;
  isLoadingRestaurants = true;
  isLoadingDishes = true;
  
  ngOnInit(): void {
    this.loadActivities();
    this.loadTrendingRestaurants();
    this.loadPopularDishes();
  }
  
  /**
   * Carga las actividades recientes
   */
  loadActivities(): void {
    this.isLoadingActivities = true;
    
    this.mockDataService.getActivities().subscribe({
      next: (activities) => {
        this.activities = activities.slice(0, 10); // Mostrar solo las 10 más recientes
        this.isLoadingActivities = false;
      },
      error: (err) => {
        console.error('Error al cargar actividades', err);
        this.isLoadingActivities = false;
      }
    });
  }
  
  /**
   * Carga restaurantes en tendencia
   */
  loadTrendingRestaurants(): void {
    this.isLoadingRestaurants = true;
    
    this.mockDataService.getRestaurants().subscribe({
      next: (restaurants) => {
        // En un caso real, filtrar por los más populares o con mejor valoración
        this.trendingRestaurants = restaurants.slice(0, 3);
        this.isLoadingRestaurants = false;
      },
      error: (err) => {
        console.error('Error al cargar restaurantes', err);
        this.isLoadingRestaurants = false;
      }
    });
  }
  
  /**
   * Carga platos populares
   */
  loadPopularDishes(): void {
    this.isLoadingDishes = true;
    
    this.mockDataService.getDishes().subscribe({
      next: (dishes) => {
        // En un caso real, ordenar por rating y número de favoritos
        this.popularDishes = dishes.slice(0, 6);
        this.isLoadingDishes = false;
      },
      error: (err) => {
        console.error('Error al cargar platos', err);
        this.isLoadingDishes = false;
      }
    });
  }
  
  /**
   * Formatea la fecha para mostrar de forma amigable
   */
  formatActivityDate(date: Date | string): string {
    if (!date) return '';
    
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
        return `ha valorado ${activity.targetName}`;
      case 'favorite':
        return `ha marcado como favorito ${activity.targetName}`;
      case 'visit':
        return `ha visitado ${activity.targetName}`;
      case 'route_completed':
        return `ha completado la ruta ${activity.targetName}`;
      case 'route_created':
        return `ha creado una nueva ruta: ${activity.targetName}`;
      case 'follow_restaurant':
        return `ahora sigue a ${activity.targetName}`;
      case 'follow_user':
        return `ahora sigue a ${activity.targetName}`;
      case 'badge_earned':
        return `ha ganado la insignia ${activity.targetName}`;
      default:
        return 'ha realizado una actividad';
    }
  }
}