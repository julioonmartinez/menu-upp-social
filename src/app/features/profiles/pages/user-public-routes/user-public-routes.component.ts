import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
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
export class UserPublicRoutesComponent implements OnInit, OnDestroy, AfterViewInit {
  // Servicios
  private profileService = inject(ProfileService);
  private routesService = inject(RoutesService);
  private route = inject(ActivatedRoute);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Referencias a los botones de tab para medir sus dimensiones
  @ViewChildren('tabButton') tabButtons!: QueryList<ElementRef>;
  
  // Para el indicador dinámico
  indicatorPosition = { left: '0', width: '0' };
  
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
  
  ngAfterViewInit(): void {
    // Inicializar el indicador después de que la vista se haya inicializado
    setTimeout(() => this.updateIndicator(), 0);
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
      
      // Actualizar el indicador después de cargar datos
      setTimeout(() => this.updateIndicator(), 0);
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
   * Cambia la pestaña activa y actualiza el indicador
   */
  setActiveTab(tab: 'created' | 'completed' | 'in-progress'): void {
    this.activeTab = tab;
    
    // Actualizar el indicador después de un cambio de pestaña
    setTimeout(() => this.updateIndicator(), 0);
  }
  
  /**
   * Actualiza la posición y ancho del indicador según la pestaña activa
   */
  updateIndicator(): void {
    if (!this.tabButtons || this.tabButtons.length === 0) return;
    
    const activeIndex = this.getActiveTabIndex();
    if (activeIndex === -1) return;
    
    const activeButton = this.tabButtons.toArray()[activeIndex].nativeElement;
    const parentLeft = activeButton.parentElement.getBoundingClientRect().left;
    const buttonRect = activeButton.getBoundingClientRect();
    
    this.indicatorPosition = {
      left: `${buttonRect.left - parentLeft + 4}px`,
      width: `${buttonRect.width - 8}px`
    };
  }
  
  /**
   * Obtiene el índice de la pestaña activa
   */
  getActiveTabIndex(): number {
    switch (this.activeTab) {
      case 'created': return 0;
      case 'completed': return 1;
      case 'in-progress': return 2;
      default: return -1;
    }
  }
  
  /**
   * Obtiene los estilos para el indicador de tabs
   */
  getIndicatorStyles(): { [key: string]: string } {
    return {
      left: this.indicatorPosition.left,
      width: this.indicatorPosition.width
    };
  }
  
  /**
   * Maneja la navegación por teclado entre pestañas
   * @param event Evento de teclado
   */
  handleTabKeyNavigation(event: KeyboardEvent): void {
    // Solo procesamos si estamos en un elemento de tab
    if (!(event.target instanceof HTMLElement) || 
        !event.target.classList.contains('tab-button')) {
      return;
    }
    
    // Obtenemos el índice actual y calculamos el siguiente según la tecla
    const currentIndex = this.getActiveTabIndex();
    let nextIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = Math.min(currentIndex + 1, 2); // 2 es el índice máximo (0, 1, 2)
        break;
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = 2; // Último tab
        break;
      default:
        return; // No procesamos otras teclas
    }
    
    // Si el índice cambió, actualizamos la pestaña activa
    if (nextIndex !== currentIndex) {
      const tabNames: ('created' | 'completed' | 'in-progress')[] = ['created', 'completed', 'in-progress'];
      this.setActiveTab(tabNames[nextIndex]);
      
      // Enfocamos el botón correspondiente
      setTimeout(() => {
        const buttons = this.tabButtons.toArray();
        if (buttons[nextIndex]) {
          buttons[nextIndex].nativeElement.focus();
        }
      });
    }
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