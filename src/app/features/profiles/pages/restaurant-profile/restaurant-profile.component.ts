import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ProfileService } from '../../../../core/services/profile.service';
import { MenuService } from '../../../../core/services/menu.service';
import { ProfileHeaderComponent } from '../../../../shared/components/profile-header/profile-header.component';
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
    ProfileHeaderComponent,
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
  
  ngOnInit(): void {
    // Obtener el username de la ruta
    this.route.parent?.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const username = params['username'];
      if (username) {
        this.profileService.loadProfileByUsername(username);
        
        // Cargar platos del restaurante
        if (this.restaurantId) {
          this.menuService.loadDishes(this.restaurantId);
        }
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Limpiar estado al salir
    this.profileService.clearProfile();
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