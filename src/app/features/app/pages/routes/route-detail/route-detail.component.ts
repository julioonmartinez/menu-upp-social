import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

import { RoutesService } from '../../../../../core/services/routes.service';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { GastronomicRoute, RouteReview } from '../../../../../core/models/route.model';

import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../../shared/components/card/card.component';
import { RouteProgressComponent } from '../../../../../shared/components/route-progress/route-progress.component';

/**
 * Componente de detalle de ruta gastronómica
 * 
 * Muestra la información detallada de una ruta gastronómica,
 * incluyendo sus paradas, progreso y reseñas.
 */
@Component({
  selector: 'app-route-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    RouteProgressComponent
  ],
  templateUrl: './route-detail.component.html',
  styleUrls: ['./route-detail.component.scss']
})
export class RouteDetailComponent implements OnInit {
  // Servicios
  private routesService = inject(RoutesService);
  private mockDataService = inject(MockDataService);
  private activatedRoute = inject(ActivatedRoute);
  
  // Datos
  routeId: string = '';
  reviews: RouteReview[] = [];
  
  // Estados
  loadingReviews = false;
  loadingAction = false;
  error: string | null = null;
  
  ngOnInit(): void {
    // Obtener ID de la ruta de los parámetros
    this.activatedRoute.params.subscribe(params => {
      this.routeId = params['routeId'];
      this.loadRouteData();
    });
  }
  
  /**
   * Carga los datos de la ruta
   */
  loadRouteData(): void {
    // Cargar la ruta
    this.routesService.loadRouteById(this.routeId);
    
    // Cargar reseñas
    this.loadReviews();
  }
  
  /**
   * Carga las reseñas de la ruta
   */
  loadReviews(): void {
    this.loadingReviews = true;
    
    this.mockDataService.getRouteReviews(this.routeId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.loadingReviews = false;
      },
      error: (err) => {
        console.error('Error loading reviews', err);
        this.loadingReviews = false;
      }
    });
  }
  
  /**
   * Inicia la ruta para el usuario
   */
  startRoute(): void {
    this.loadingAction = true;
    
    this.routesService.startRoute(this.routeId).subscribe({
      next: (success) => {
        this.loadingAction = false;
        // En una app real, podríamos mostrar un mensaje de éxito
      },
      error: (err) => {
        console.error('Error starting route', err);
        this.loadingAction = false;
        this.error = 'No se pudo iniciar la ruta';
      }
    });
  }
  
  /**
   * Completa una parada de la ruta
   */
  completeStop(stopId: string): void {
    this.loadingAction = true;
    
    this.routesService.completeRouteStop(this.routeId, stopId).subscribe({
      next: (success) => {
        this.loadingAction = false;
        // En una app real, podríamos mostrar un mensaje de éxito
      },
      error: (err) => {
        console.error('Error completing stop', err);
        this.loadingAction = false;
        this.error = 'No se pudo completar la parada';
      }
    });
  }
  
  /**
   * Formatea la fecha en formato legible
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const routeDate = new Date(date);
    return routeDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**
   * Genera un estilo para una estrellas según la valoración
   */
  getStarClass(index: number, rating: number): string {
    if (index < Math.floor(rating)) {
      return 'star-full';
    } else if (index < Math.ceil(rating) && index >= Math.floor(rating)) {
      return 'star-half';
    } else {
      return 'star-empty';
    }
  }
  
  /**
   * Calcula la duración en formato legible
   */
  formatDuration(minutes: number | undefined): string {
    if (!minutes) return '';
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    
    return `${hours} h ${remainingMinutes} min`;
  }
  
  /**
   * Genera el enlace a Google Maps para una dirección
   */
  getGoogleMapsLink(address: string | undefined): string {
    if (!address) return '#';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  
  /**
   * Ruta actual desde el servicio
   */
  get route(): GastronomicRoute | null {
    return this.routesService.currentRoute() ;
  }


  
  /**
   * Estado de carga desde el servicio
   */
  get loading(): boolean {
    return this.routesService.loading();
  }
  
  /**
   * Mensaje de error desde el servicio
   */
  get routeError(): string | null {
    return this.routesService.error();
  }
  /**
   * Comprueba si una parada es la última en la lista
   */
  isLastStop(stop: any): boolean {
    if (!this.route || !this.route.stops) return true;
    return this.route.stops[this.route.stops.length - 1].id === stop.id;
  }
}