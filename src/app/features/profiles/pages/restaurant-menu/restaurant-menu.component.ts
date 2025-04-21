import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ProfileService } from '../../../../core/services/profile.service';
import { MenuService } from '../../../../core/services/menu.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { DishCardComponent } from '../../../../shared/components/dish-card/dish-card.component';
import { Dish, Category } from '../../../../core/models/dish.model';

/**
 * Componente para mostrar el menú de un restaurante
 * 
 * Muestra las categorías y platos del menú, con opciones de filtrado
 * y búsqueda.
 */
@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    DishCardComponent
  ],
  templateUrl: './restaurant-menu.component.html',
  styleUrls: ['./restaurant-menu.component.scss']
})
export class RestaurantMenuComponent implements OnInit, OnDestroy {
  // Servicios
  private profileService = inject(ProfileService);
  private menuService = inject(MenuService);
  private route = inject(ActivatedRoute);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Filtros
  searchQuery = '';
  selectedCategory: string | null = null;
  selectedRating: number | null = null;
  showOnlyFavorites = false;
  priceRange: [number, number] | null = null;
  showFiltersPanel: any;
  
  ngOnInit(): void {
    // Obtener el username y category de la ruta
    this.route.parent?.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const username = params['username'];
      if (username) {
        this.profileService.loadProfileByUsername(username);
      }
    });
    
    // Obtener categoría si está en la ruta
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const categoryId = params['categoryId'];
      if (categoryId) {
        this.selectedCategory = categoryId;
        this.menuService.selectCategory(categoryId);
      }
    });
    
    // Cargar datos cuando cambie el restaurante
    this.route.parent?.params.subscribe(params => {
      if (this.restaurantId) {
        this.menuService.loadDishes(this.restaurantId);
        this.menuService.loadCategories(this.restaurantId);
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Limpiar filtros
    this.menuService.resetFilters();
  }
  
  /**
   * Selecciona una categoría
   */
  selectCategory(categoryId: string | null): void {
    this.selectedCategory = categoryId;
    this.menuService.selectCategory(categoryId);
  }
  
  /**
   * Actualiza la búsqueda
   */
  updateSearch(): void {
    this.menuService.setSearchQuery(this.searchQuery);
  }
  
  /**
   * Establece el filtro de valoración
   */
  setRatingFilter(rating: number | null): void {
    this.selectedRating = rating;
    this.menuService.setRatingFilter(rating);
  }
  
  /**
   * Establece el filtro de favoritos
   */
  toggleFavoritesFilter(): void {
    this.showOnlyFavorites = !this.showOnlyFavorites;
    this.menuService.setFavoritesFilter(this.showOnlyFavorites);
  }
  
  /**
   * Establece el filtro de precio
   */
  setPriceFilter(min: number, max: number): void {
    this.priceRange = [min, max];
    this.menuService.setPriceFilter([min, max]);
  }
  
  /**
   * Reinicia todos los filtros
   */
  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.selectedRating = null;
    this.showOnlyFavorites = false;
    this.priceRange = null;
    this.menuService.resetFilters();
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
  
  // Getters
  
  get restaurant() {
    return this.profileService.currentRestaurant();
  }
  
  get restaurantId(): string {
    return this.restaurant?.id || '';
  }
  
  get restaurantUsername(): string {
    return this.profileService.currentProfileUsername();
  }
  
  get categories(): Category[] {
    return this.menuService.categories();
  }
  
  get dishes(): Dish[] {
    return this.menuService.filteredDishes();
  }
  
  get dishCountByCategory(): Record<string, number> {
    return this.menuService.dishCountByCategory();
  }
  
  get priceRangeMinMax(): [number, number] {
    const range = this.menuService.priceRange();
    return [range[0] ?? 0, range[1] ?? 0] as [number, number];
  }
  
  get loading(): boolean {
    return this.profileService.loading();
  }
  
  get loadingCategories(): boolean {
    return this.menuService.loadingCategories();
  }
  
  get loadingDishes(): boolean {
    return this.menuService.loading();
  }
  
  get error(): string | null {
    return this.profileService.error() || this.menuService.error();
  }
  
  get isRestaurant(): boolean {
    return this.profileService.profileType() === 'restaurant';
  }
  
  get hasFiltersApplied(): boolean {
    return !!(
      this.searchQuery || 
      this.selectedCategory || 
      this.selectedRating !== null || 
      this.showOnlyFavorites || 
      this.priceRange
    );
  }

  /**
   * Muestra/oculta el panel de filtros
   */
  toggleFiltersPanel(): void {
    this.showFiltersPanel = !this.showFiltersPanel;
  }
  
  /**
   * Obtiene el nombre de la categoría seleccionada
   */
  getSelectedCategoryName(): string {
    if (!this.selectedCategory) return 'Todos los platos';
    
    const category = this.categories.find(c => c.id === this.selectedCategory);
    return category ? category.name : 'Categoría';
  }
  
  /**
   * Obtiene la descripción de la categoría seleccionada
   */
  getSelectedCategoryDescription(): string {
    if (!this.selectedCategory) return '';
    
    const category = this.categories.find(c => c.id === this.selectedCategory);
    return category?.description || '';
  }
  
  /**
   * Cuenta el número de filtros activos
   */
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchQuery) count++;
    if (this.selectedCategory) count++;
    if (this.selectedRating !== null) count++;
    if (this.showOnlyFavorites) count++;
    if (this.priceRange) count++;
    return count;
  }
  

}