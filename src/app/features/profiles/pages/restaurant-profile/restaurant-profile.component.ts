import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ProfileService } from '../../../../core/services/profile.service';
import { MenuService } from '../../../../core/services/menu.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DishCardComponent } from '../../../../shared/components/dish-card/dish-card.component';
import { Dish } from '../../../../core/models/dish.model';

/**
 * Componente para mostrar la página principal de un perfil de restaurante
 * 
 * Muestra información general, platos destacados y permite navegar a las
 * diferentes secciones del perfil.
 */
@Component({
  selector: 'app-restaurant-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    DishCardComponent
  ],
  templateUrl: './restaurant-profile.component.html',
  styleUrls: ['./restaurant-profile.component.scss']
})
export class RestaurantProfileComponent implements OnInit, OnDestroy {
  // Servicios
  private profileService = inject(ProfileService);
  private menuService = inject(MenuService);
  private route = inject(ActivatedRoute);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Estados
  loadingFollow = false;
  
  constructor() {
    // Efecto para reaccionar cuando hay cambios en el restaurante
    effect(() => {
      const restaurant = this.profileService.currentRestaurant();
      
      if (restaurant && restaurant.id) {
        console.log('RestaurantProfile Effect: Detectado restaurante:', restaurant.name);
        this.loadFeaturedDishes(restaurant.id);
      }
    });
  }
  
  /**
   * Método para cargar los platos destacados del restaurante
   */
  private loadFeaturedDishes(restaurantId: string): void {
    // Verificar si ya tenemos platos cargados para este restaurante
    const currentLoadedId = this.menuService.loadedRestaurantId();
    
    if (currentLoadedId !== restaurantId) {
      console.log('RestaurantProfile: Cargando platos para nuevo restaurante:', restaurantId);
      this.menuService.loadDishes(restaurantId);
    } else {
      console.log('RestaurantProfile: Usando platos en caché para:', restaurantId);
    }
  }
  
  ngOnInit(): void {
    // Ya no necesitamos cargar el perfil aquí, el ProfileLayoutComponent lo hará
    // Y el effect se encargará de cargar los platos cuando el restaurante esté disponible
    
    // Solo verificamos si se necesita forzar una recarga
    if (!this.profileService.dataLoaded()) {
      this.route.parent?.params.pipe(
        takeUntil(this.destroy$)
      ).subscribe(params => {
        const username = params['username'];
        if (username) {
          console.log('RestaurantProfile: Verificando carga de perfil para:', username);
          this.profileService.loadProfileByUsername(username);
        }
      });
    }
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // No limpiamos el perfil al salir para evitar recargas innecesarias
    // Solo limpiaríamos datos específicos de este componente si fuera necesario
  }
  
  /**
   * Maneja seguir/dejar de seguir al restaurante
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
    // En una app real, aquí se implementaría la funcionalidad de compartir
    console.log('Compartir perfil:', this.restaurantUsername);
  }
  
  /**
   * Maneja marcar/desmarcar un plato como favorito
   */
  onFavoriteClick(dishId: string): void {
    this.menuService.toggleFavorite(dishId);
  }
  
  /**
   * Maneja clic en valorar un plato
   */
  onRateClick(dishId: string): void {
    // En una app real, aquí se mostraría un diálogo para valorar
    console.log('Valorar plato:', dishId);
  }
  
  // Getters para acceder al estado
  
  get restaurant() {
    return this.profileService.currentRestaurant();
  }
  
  get restaurantId(): string {
    return this.restaurant?.id || '';
  }
  
  get restaurantName(): string {
    return this.profileService.currentProfileName();
  }
  
  get restaurantUsername(): string {
    return this.profileService.currentProfileUsername();
  }
  
  get restaurantDescription(): string {
    return this.restaurant?.description || '';
  }
  
  get restaurantLogo() {
    return this.profileService.currentProfileImage();
  }
  
  get restaurantCover() {
    return this.profileService.currentProfileCover();
  }
  
  get restaurantFollowers(): number {
    return this.profileService.followers();
  }
  
  get restaurantRating(): number | null {
    return this.restaurant?.rating?.average || null;
  }
  
  get restaurantRatingCount(): number {
    return this.restaurant?.rating?.count || 0;
  }
  
  get isFollowing(): boolean {
    return this.profileService.isFollowing();
  }
  
  get loading(): boolean {
    return this.profileService.loading();
  }
  
  get error(): string | null {
    return this.profileService.error();
  }
  
  get featuredDishes(): Dish[] {
    // Filtrar platos destacados
    return this.menuService.dishes().filter(dish => dish.featured).slice(0, 6);
  }
  
  get loadingDishes(): boolean {
    return this.menuService.loading();
  }
  
  get isRestaurant(): boolean {
    return this.profileService.profileType() === 'restaurant';
  }
  
  get hasFeaturedDishes(): boolean {
    return this.featuredDishes.length > 0;
  }

  /**
   * Formatea el nombre del día
   */
  formatDayName(day: string): string {
    const days: Record<string, string> = {
      'monday': 'Lunes',
      'tuesday': 'Martes',
      'wednesday': 'Miércoles',
      'thursday': 'Jueves',
      'friday': 'Viernes',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    
    return days[day] || day;
  }
  
  /**
   * Obtiene una vista previa del horario (primeros 3 días)
   */
  getPreviewSchedule(): any[] {
    if (!this.restaurant?.schedule) return [];
    return this.restaurant.schedule.slice(0, 3);
  }
}