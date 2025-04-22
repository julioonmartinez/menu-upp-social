import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ProfileService } from '../../../../core/services/profile.service';
import { RoutesService } from '../../../../core/services/routes.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { RouteCardComponent } from '../../../../shared/components/route-card/route-card.component';
import { GastronomicRoute } from '../../../../core/models/route.model';

/**
 * Componente para mostrar las rutas gastronómicas públicas de un usuario
 * 
 * Muestra las rutas creadas por el usuario, sus rutas completadas
 * y rutas en progreso.
 */
@Component({
  selector: 'app-user-public-routes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    RouteCardComponent
  ],
  templateUrl: './user-public-routes.component.html',
  styleUrls: ['./user-public-routes.component.scss']
})
export class UserPublicRoutesComponent implements OnInit, OnDestroy {
  // Servicios
  private profileService = inject(ProfileService);
  private routesService = inject(RoutesService);
  private route = inject(ActivatedRoute);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Estados locales
  activeTab: 'created' | 'completed' | 'in-progress' = 'created';
  createdRoutes: GastronomicRoute[] = [];
  completedRoutes: GastronomicRoute[] = [];
  inProgressRoutes: GastronomicRoute[] = [];
  loadingRoutes = false;
  
  ngOnInit(): void {
    // Obtener el username de la ruta
    this.route.parent?.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const username = params['username'];
      if (username) {
        this.profileService.loadProfileByUsername(username);
        
        // Cargar rutas del usuario cuando el perfil está cargado
        if (this.userId) {
          this.loadUserRoutes();
        }
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Carga las rutas del usuario
   */
  loadUserRoutes(): void {
    this.loadingRoutes = true;
    
    // Cargar rutas creadas por el usuario
    this.routesService.loadRoutesByUser(this.userId);
    
    // Simular la carga de rutas completadas y en progreso
    // En una implementación real, esta lógica estaría en el servicio
    setTimeout(() => {
      // Simular rutas completadas y en progreso
      this.completedRoutes = this.getRoutesWithCompletionStatus(true);
      this.inProgressRoutes = this.getRoutesWithCompletionStatus(false);
      this.loadingRoutes = false;
    }, 1000);
  }
  
  /**
   * Obtiene rutas con un estado de completado específico
   */
  getRoutesWithCompletionStatus(isCompleted: boolean): GastronomicRoute[] {
    // Filtrar rutas según su estado de completado
    return this.routes.filter(route => {
      if (!route.completionStatus?.isStarted) {
        return false;
      }
      
      if (isCompleted) {
        return !!route.completionStatus.completedDate;
      } else {
        return !route.completionStatus.completedDate;
      }
    });
  }
  
  /**
   * Cambia la pestaña activa
   */
  setActiveTab(tab: 'created' | 'completed' | 'in-progress'): void {
    this.activeTab = tab;
  }
  
  // Getters
  
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
  
  get userUsername(): string {
    return this.profileService.currentProfileUsername();
  }
  
  get userImage() {
    return this.profileService.currentProfileImage();
  }
  
  get routes(): GastronomicRoute[] {
    return this.routesService.routes();
  }
  
  get createdRoutesCount(): number {
    return this.routes.length;
  }
  
  get completedRoutesCount(): number {
    return this.completedRoutes.length;
  }
  
  get inProgressRoutesCount(): number {
    return this.inProgressRoutes.length;
  }
  
  get loading(): boolean {
    return this.profileService.loading();
  }
  
  get error(): string | null {
    return this.profileService.error() || this.routesService.error();
  }
  
  get isUser(): boolean {
    return this.profileService.profileType() === 'user';
  }
  
  get activeRoutes(): GastronomicRoute[] {
    switch (this.activeTab) {
      case 'created':
        return this.routes;
      case 'completed':
        return this.completedRoutes;
      case 'in-progress':
        return this.inProgressRoutes;
      default:
        return [];
    }
  }
}