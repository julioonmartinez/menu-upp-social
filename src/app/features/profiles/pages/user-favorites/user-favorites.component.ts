import { Component, OnInit, OnDestroy, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ProfileService } from '../../../../core/services/profile.service';
import { MenuService } from '../../../../core/services/menu.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DishCardComponent } from '../../../../shared/components/dish-card/dish-card.component';
import { Dish } from '../../../../core/models/dish.model';

/**
 * Componente para mostrar los platos favoritos de un usuario
 * 
 * Permite visualizar y filtrar los platos que el usuario ha marcado
 * como favoritos, con opciones para quitar de favoritos y ordenación.
 */
@Component({
  selector: 'app-user-favorites',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    DishCardComponent
  ],
  templateUrl: './user-favorites.component.html',
  styleUrls: ['./user-favorites.component.scss']
})
export class UserFavoritesComponent implements OnInit, OnDestroy {
  // Servicios
  private profileService = inject(ProfileService);
  private menuService = inject(MenuService);
  private route = inject(ActivatedRoute);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Signals locales
  private _favoriteDishes = signal<Dish[]>([]);
  private _filteredDishes = signal<Dish[]>([]);
  private _loadingDishes = signal<boolean>(false);
  private _searchQuery = signal<string>('');
  private _sortOption = signal<'name' | 'rating' | 'recent'>('recent');
  
  // Hacemos públicas las signals como readonly para el template
  get favoriteDishes() { return this._favoriteDishes(); }
  get filteredDishes() { return this._filteredDishes(); }
  get loadingDishes() { return this._loadingDishes(); }
  get searchQuery() { return this._searchQuery(); }
  get sortOption() { return this._sortOption(); }
  
  // Setters para modificar las signals
  set searchQuery(value: string) {
    this._searchQuery.set(value);
    this.filterAndSortDishes();
  }
  
  constructor() {
    // Usar effect para reaccionar a cambios en los platos del menú
    effect(() => {
      // Si los dishes del MenuService cambian, actualizamos nuestros favoritos
      const allDishes = this.menuService.dishes();
      
      if (allDishes.length > 0 && !this._loadingDishes()) {
        this.processFavoriteDishes(allDishes);
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
    
    // Cargar los platos favoritos
    this.loadFavoriteDishes();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Carga los platos favoritos del usuario
   */
  loadFavoriteDishes(): void {
    this._loadingDishes.set(true);
    
    // Primero asegurarnos de cargar todos los platos disponibles
    const restaurantIds = ['restaurant1', 'restaurant2', 'restaurant3']; // IDs de ejemplo
    
    // Cargar platos de varios restaurantes, en una implementación real
    // estos vendrían de un endpoint específico de favoritos
    restaurantIds.forEach(id => {
      this.menuService.loadDishes(id, false);
    });
    
    // Esperar un poco para simular la carga
    setTimeout(() => {
      // En una implementación real, no necesitaríamos este timeout
      // ya que el effect reaccionaría automáticamente a los cambios en menuService.dishes()
      this._loadingDishes.set(false);
    }, 1200);
  }
  
  /**
   * Procesa la lista de platos para filtrar los favoritos
   */
  private processFavoriteDishes(allDishes: Dish[]): void {
    // Si el usuario tiene favoritos definidos, filtrar por esos IDs
    if (this.user?.favorites && this.user.favorites.length > 0) {
      const favoriteIds = this.user.favorites;
      const dishes = allDishes.filter(dish => favoriteIds.includes(dish.id || ''));
      this._favoriteDishes.set(dishes);
    } else {
      // Si no hay favoritos definidos, simular con platos que tengan alta puntuación de favoritos
      const dishes = allDishes
        .filter(dish => (dish.favorites || 0) > 10)
        .slice(0, 8); // Limitar a 8 para demo
      this._favoriteDishes.set(dishes);
    }
    
    this.filterAndSortDishes();
  }
  
  /**
   * Maneja la acción de quitar de favoritos
   */
  onRemoveFavorite(dishId: string): void {
    // Remover el plato de la lista local
    const updatedDishes = this._favoriteDishes().filter(dish => dish.id !== dishId);
    this._favoriteDishes.set(updatedDishes);
    
    // Actualizar la lista filtrada
    this.filterAndSortDishes();
    
    // En una app real, esto llamaría al servicio para actualizar en el servidor
    this.menuService.toggleFavorite(dishId);
  }
  
  /**
   * Maneja clic en valorar un plato
   */
  onRateClick(dishId: string): void {
    // En una app real, aquí se mostraría un diálogo para valorar
    console.log('Valorar plato:', dishId);
  }
  
  /**
   * Aplica filtros y ordenación a los platos
   */
  filterAndSortDishes(): void {
    // Aplicar filtro de búsqueda
    let result = [...this._favoriteDishes()];
    const query = this._searchQuery().toLowerCase().trim();
    
    if (query) {
      result = result.filter(dish => 
        dish.name.toLowerCase().includes(query) ||
        dish.description?.toLowerCase().includes(query) ||
        dish.ingredients?.some(ing => ing.toLowerCase().includes(query))
      );
    }
    
    // Aplicar ordenación
    switch (this._sortOption()) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0));
        break;
      case 'recent':
        // Simular ordenación por fecha (en una app real usaríamos una fecha de añadido a favoritos)
        // Aquí simplemente usamos el ID como aproximación
        result.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        break;
    }
    
    this._filteredDishes.set(result);
  }
  
  /**
   * Actualiza la búsqueda
   */
  updateSearch(): void {
    this.filterAndSortDishes();
  }
  
  /**
   * Actualiza la opción de ordenación
   */
  updateSortOption(option: 'name' | 'rating' | 'recent'): void {
    this._sortOption.set(option);
    this.filterAndSortDishes();
  }
  
  // Getters para acceder al estado
  
  get user() {
    return this.profileService.currentUser();
  }
  
  get userName(): string {
    const user = this.user;
    return user ? `${user.name} ${user.lastName || ''}` : '';
  }
  
  get username(): string {
    return this.profileService.currentProfileUsername();
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