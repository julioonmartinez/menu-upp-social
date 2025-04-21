import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MockDataService } from '../../../../../core/services/mock-data.service';
import { GastronomicRoute } from '../../../../../core/models/route.model';

import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../../shared/components/card/card.component';
import { RouteCardComponent } from '../../../../../shared/components/route-card/route-card.component';

/**
 * Componente para gestionar las rutas del usuario
 * 
 * Muestra rutas creadas, guardadas, completadas y en progreso
 */
@Component({
  selector: 'app-my-routes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    RouteCardComponent
  ],
  templateUrl: './my-routes.component.html',
  styleUrls: ['./my-routes.component.scss']
})
export class MyRoutesComponent implements OnInit {
  // Servicios
  private mockDataService = inject(MockDataService);
  
  // Datos
  ownRoutes: GastronomicRoute[] = [];
  inProgressRoutes: GastronomicRoute[] = [];
  completedRoutes: GastronomicRoute[] = [];
  
  // Estados
  activeTab: 'own' | 'progress' | 'completed' = 'own';
  loadingOwn = false;
  loadingProgress = false;
  loadingCompleted = false;
  error: string | null = null;
  
  // En una app real, obtendríamos este ID del servicio de autenticación
  userId = 'user1';
  
  ngOnInit(): void {
    this.loadOwnRoutes();
    this.loadInProgressRoutes();
    this.loadCompletedRoutes();
  }
  
  /**
   * Carga las rutas creadas por el usuario
   */
  loadOwnRoutes(): void {
    this.loadingOwn = true;
    
    this.mockDataService.getRoutesByUser(this.userId).subscribe({
      next: (routes) => {
        this.ownRoutes = routes;
        this.loadingOwn = false;
      },
      error: (err) => {
        console.error('Error loading own routes', err);
        this.error = 'Error al cargar tus rutas creadas';
        this.loadingOwn = false;
      }
    });
  }
  
  /**
   * Carga las rutas en progreso del usuario
   */
  loadInProgressRoutes(): void {
    this.loadingProgress = true;
    
    this.mockDataService.getInProgressRoutesByUser(this.userId).subscribe({
      next: (routes) => {
        this.inProgressRoutes = routes;
        this.loadingProgress = false;
      },
      error: (err) => {
        console.error('Error loading in-progress routes', err);
        this.error = 'Error al cargar tus rutas en progreso';
        this.loadingProgress = false;
      }
    });
  }
  
  /**
   * Carga las rutas completadas por el usuario
   */
  loadCompletedRoutes(): void {
    this.loadingCompleted = true;
    
    this.mockDataService.getCompletedRoutesByUser(this.userId).subscribe({
      next: (routes) => {
        this.completedRoutes = routes;
        this.loadingCompleted = false;
      },
      error: (err) => {
        console.error('Error loading completed routes', err);
        this.error = 'Error al cargar tus rutas completadas';
        this.loadingCompleted = false;
      }
    });
  }
  
  /**
   * Cambia la pestaña activa
   */
  changeTab(tab: 'own' | 'progress' | 'completed'): void {
    this.activeTab = tab;
  }
  

  /**
   * Calcula el número total de restaurantes visitados
   */
  getTotalRestaurantsVisited(): number {
    // En una implementación real, este cálculo sería más preciso
    // Aquí simplemente sumamos las paradas de rutas completadas
    let total = 0;
    
    this.completedRoutes.forEach(route => {
      if (route.completionStatus?.isStarted && route.completionStatus?.completedDate) {
        total += route.totalRestaurants || route.stops.length;
      }
    });
    
    return total;
  }
  
  /**
   * Comprueba si hay rutas cargadas para la pestaña actual
   */
  get hasRoutesInCurrentTab(): boolean {
    switch (this.activeTab) {
      case 'own':
        return this.ownRoutes.length > 0;
      case 'progress':
        return this.inProgressRoutes.length > 0;
      case 'completed':
        return this.completedRoutes.length > 0;
    }
  }
  
  /**
   * Comprueba si hay carga en la pestaña actual
   */
  get isLoadingCurrentTab(): boolean {
    switch (this.activeTab) {
      case 'own':
        return this.loadingOwn;
      case 'progress':
        return this.loadingProgress;
      case 'completed':
        return this.loadingCompleted;
    }
  }

}