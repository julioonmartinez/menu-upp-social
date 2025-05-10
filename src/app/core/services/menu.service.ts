import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { MockDataService } from './mock-data.service';
import { Dish, Category } from '../models/dish.model';
import { DishService } from './dish.service';

/**
 * Servicio para gestionar menús de restaurantes
 * 
 * Maneja la carga, categorización y filtrado de platos
 */
@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private mockDataService = inject(MockDataService);
  private dishService = inject(DishService)
  
  // Signals
  private _dishes = signal<Dish[]>([]);
  private _categories = signal<Category[]>([]);
  private _selectedCategoryId = signal<string | null>(null);
  private _selectedDish = signal<Dish | null>(null);
  private _loading = signal<boolean>(false);
  private _loadingCategories = signal<boolean>(false);
  private _loadingDish = signal<boolean>(false);
  private _error = signal<string | null>(null);
  
  // Filtros
  private _priceFilter = signal<[number, number] | null>(null);
  private _ratingFilter = signal<number | null>(null);
  private _onlyFavorites = signal<boolean>(false);
  private _searchQuery = signal<string>('');
  
  // Control de cache
  private _loadedRestaurantId = signal<string | null>(null);
  private _loadedCategoriesRestaurantId = signal<string | null>(null);
  private _lastDishesLoadTime = signal<number>(0);
  private _lastCategoriesLoadTime = signal<number>(0);
  
  // Exposición de signals como readonly
  public dishes = this._dishes.asReadonly();
  public categories = this._categories.asReadonly();
  public selectedCategoryId = this._selectedCategoryId.asReadonly();
  public selectedDish = this._selectedDish.asReadonly();
  public loading = this._loading.asReadonly();
  public loadingCategories = this._loadingCategories.asReadonly();
  public loadingDish = this._loadingDish.asReadonly();
  public error = this._error.asReadonly();
  public priceFilter = this._priceFilter.asReadonly();
  public ratingFilter = this._ratingFilter.asReadonly();
  public onlyFavorites = this._onlyFavorites.asReadonly();
  public searchQuery = this._searchQuery.asReadonly();
  public loadedRestaurantId = this._loadedRestaurantId.asReadonly();
  
  // Señales computadas
  public filteredDishes = computed(() => {
    let result = this._dishes();
    const categoryId = this._selectedCategoryId();
    const priceRange = this._priceFilter();
    const minRating = this._ratingFilter();
    const query = this._searchQuery();
    const favoritesOnly = this._onlyFavorites();
    
    // Filtrar por categoría
    if (categoryId) {
      result = result.filter(dish => dish.categoryId === categoryId);
    }
    
    // Filtrar por rango de precio
    if (priceRange) {
      result = result.filter(dish => 
        dish.price >= priceRange[0] && dish.price <= priceRange[1]
      );
    }
    
    // Filtrar por valoración mínima
    if (minRating !== null) {
      result = result.filter(dish => 
        (dish.rating?.average || 0) >= minRating
      );
    }
    
    // Filtrar por favoritos
    if (favoritesOnly) {
      // En una app real, comprobaríamos con los favoritos del usuario
      result = result.filter(dish => (dish.favorites || 0) > 10);
    }
    
    // Filtrar por búsqueda
    if (query.trim()) {
      const normalizedQuery = query.toLowerCase().trim();
      result = result.filter(dish => 
        dish.name.toLowerCase().includes(normalizedQuery) ||
        dish.description?.toLowerCase().includes(normalizedQuery)
      );
    }
    
    return result;
  });
  
  public dishesByCategory = computed(() => {
    const result: Record<string, Dish[]> = {};
    const allDishes = this._dishes();
    const allCategories = this._categories();
    
    allCategories.forEach(category => {
      if (category.id) {
        result[category.id] = allDishes.filter(
          dish => dish.categoryId === category.id
        );
      }
    });
    
    return result;
  });
  
  public selectedCategory = computed(() => {
    const categoryId = this._selectedCategoryId();
    if (!categoryId) return null;
    
    return this._categories().find(c => c.id === categoryId) || null;
  });
  
  public dishCountByCategory = computed(() => {
    const result: Record<string, number> = {};
    const allDishes = this._dishes();
    const allCategories = this._categories();
    
    allCategories.forEach(category => {
      if (category.id) {
        result[category.id] = allDishes.filter(
          dish => dish.categoryId === category.id
        ).length;
      }
    });
    
    return result;
  });
  
  public priceRange = computed(() => {
    const allDishes = this._dishes();
    if (allDishes.length === 0) return [0, 0];
    
    let min = Number.MAX_VALUE;
    let max = 0;
    
    allDishes.forEach(dish => {
      if (dish.price < min) min = dish.price;
      if (dish.price > max) max = dish.price;
    });
    
    return [min, max];
  });
  
  /**
   * Carga los platos de un restaurante si no están ya cargados
   * o si se solicita una recarga explícita
   */
  loadDishes(restaurantId: string, forceReload: boolean = false): void {
    if (!restaurantId) {
      console.error('Se intentó cargar platos con un restaurantId vacío');
      this._error.set('ID de restaurante inválido');
      return;
    }
    
    // Si ya estamos cargando, no hacemos nada
    if (this._loading()) {
      console.log('MenuService: Ya hay una carga de platos en progreso');
      return;
    }
    
    const currentTime = Date.now();
    const timeSinceLastLoad = currentTime - this._lastDishesLoadTime();
    const cacheAge = 60000; // 60 segundos
    
    // Verificar si ya tenemos datos frescos para este restaurante
    if (
      this._loadedRestaurantId() === restaurantId && 
      this._dishes().length > 0 && 
      !forceReload &&
      timeSinceLastLoad < cacheAge
    ) {
      console.log('MenuService: Usando platos en caché para restaurante:', restaurantId);
      return;
    }
    
    console.log('MenuService: Cargando platos para restaurante:', restaurantId);
    this._loading.set(true);
    this._error.set(null);
    
    this.mockDataService.getDishesByRestaurant(restaurantId).pipe(
      catchError(err => {
        console.error('Error loading dishes', err);
        this._error.set('Error al cargar los platos');
        return of([]);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe({
      next: (dishes) => {
        console.log(`MenuService: Platos cargados (${dishes.length}):`, dishes.map(d => d.name).join(', '));
        this._dishes.set(dishes);
        this._loadedRestaurantId.set(restaurantId);
        this._lastDishesLoadTime.set(Date.now());
      }
    });
    this.dishService.getDishesByRestaurantUsername(restaurantId).pipe(
      catchError(err => {
        console.error('Error loading dishes', err);
        this._error.set('Error al cargar los platos');
        return of([]);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe({
      next: (dishesResponse) => {
        console.log('MenuService: Respuesta de platos:', dishesResponse);
        // const dishes = dishesResponse.
        // console.log(`MenuService: Platos cargados (${dishes.length}):`, dishes.map(d => d.name).join(', '));
        // this._dishes.set(dishes);
        this._loadedRestaurantId.set(restaurantId);
        this._lastDishesLoadTime.set(Date.now());
      }
    });      
  }
  
  loadDishesRestaurantUsername(username:string){
    if(this._loading()){
      console.log('MenuService: Ya hay una carga de platos en progreso');
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastLoad = currentTime - this._lastDishesLoadTime();
    const cacheAge = 60000; // 60 segundos
    if(this._loadedRestaurantId() === username && this._dishes().length > 0 && timeSinceLastLoad < cacheAge){
      console.log('MenuService: Usando platos en caché para restaurante:', username);
      return;
    }
    console.log('MenuService: Cargando platos para restaurante:', username);
    this._loading.set(true);
    this._error.set(null);
    this.dishService.getDishesByRestaurantUsername(username).pipe(
      catchError(err => {
        console.error('Error loading dishes', err);
        this._error.set('Error al cargar los platos');
        return of([]);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe({
      next: (dishesResponse) => {
        console.log('MenuService: Respuesta de platos:', dishesResponse);
        // const dishes = dishesResponse.
        // console.log(`MenuService: Platos cargados (${dishes.length}):`, dishes.map(d => d.name).join(', '));
        // this._dishes.set(dishes);
        this._loadedRestaurantId.set(username);
        this._lastDishesLoadTime.set(Date.now());
      }
    });
  }
  
  /**
   * Carga las categorías de un restaurante si no están ya cargadas
   * o si se solicita una recarga explícita
   */
  loadCategories(restaurantId: string, forceReload: boolean = false): void {
    if (!restaurantId) {
      console.error('Se intentó cargar categorías con un restaurantId vacío');
      return;
    }
    
    // Si ya estamos cargando, no hacemos nada
    if (this._loadingCategories()) {
      console.log('MenuService: Ya hay una carga de categorías en progreso');
      return;
    }
    
    const currentTime = Date.now();
    const timeSinceLastLoad = currentTime - this._lastCategoriesLoadTime();
    const cacheAge = 60000; // 60 segundos
    
    // Verificar si ya tenemos datos frescos para este restaurante
    if (
      this._loadedCategoriesRestaurantId() === restaurantId && 
      this._categories().length > 0 && 
      !forceReload &&
      timeSinceLastLoad < cacheAge
    ) {
      console.log('MenuService: Usando categorías en caché para restaurante:', restaurantId);
      return;
    }
    
    console.log('MenuService: Cargando categorías para restaurante:', restaurantId);
    this._loadingCategories.set(true);
    
    this.mockDataService.getCategoriesByRestaurant(restaurantId).pipe(
      catchError(err => {
        console.error('Error loading categories', err);
        // No establecemos error general para no afectar visualización principal
        return of([]);
      }),
      finalize(() => this._loadingCategories.set(false))
    ).subscribe({
      next: (categories) => {
        console.log(`MenuService: Categorías cargadas (${categories.length}):`, categories.map(c => c.name).join(', '));
        this._categories.set(categories);
        this._loadedCategoriesRestaurantId.set(restaurantId);
        this._lastCategoriesLoadTime.set(Date.now());
      }
    });
  }
  
  /**
   * Carga un plato específico por su ID
   */
  loadDishById(dishId: string): void {
    // Si ya tenemos el plato en la lista cargada, lo usamos directamente
    const existingDish = this._dishes().find(dish => dish.id === dishId);
    if (existingDish) {
      console.log('MenuService: Usando plato en caché:', existingDish.name);
      this._selectedDish.set(existingDish);
      return;
    }
    
    this._loadingDish.set(true);
    this._error.set(null);
    
    this.mockDataService.getDishById(dishId).pipe(
      catchError(err => {
        console.error('Error loading dish', err);
        this._error.set('Error al cargar el plato');
        return of(undefined);
      }),
      finalize(() => this._loadingDish.set(false))
    ).subscribe({
      next: (dish) => {
        if (dish) {
          this._selectedDish.set(dish);
        } else {
          this._error.set('Plato no encontrado');
        }
      }
    });
  }
  
  /**
   * Establece la categoría seleccionada
   */
  selectCategory(categoryId: string | null): void {
    console.log('MenuService: Categoría seleccionada:', categoryId);
    this._selectedCategoryId.set(categoryId);
  }
  
  /**
   * Establece el filtro de precio
   */
  setPriceFilter(range: [number, number] | null): void {
    this._priceFilter.set(range);
  }
  
  /**
   * Establece el filtro de valoración
   */
  setRatingFilter(minRating: number | null): void {
    this._ratingFilter.set(minRating);
  }
  
  /**
   * Establece el filtro de favoritos
   */
  setFavoritesFilter(onlyFavorites: boolean): void {
    this._onlyFavorites.set(onlyFavorites);
  }
  
  /**
   * Establece la consulta de búsqueda
   */
  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }
  
  /**
   * Reinicia todos los filtros
   */
  resetFilters(): void {
    this._selectedCategoryId.set(null);
    this._priceFilter.set(null);
    this._ratingFilter.set(null);
    this._onlyFavorites.set(false);
    this._searchQuery.set('');
  }
  
  /**
   * Limpia el estado de los filtros pero mantiene los datos cargados
   */
  clearFilters(): void {
    this.resetFilters();
  }
  
  /**
   * Limpia completamente el estado 
   * (útil cuando se cambia completamente de restaurante)
   */
  clearAll(): void {
    this._dishes.set([]);
    this._categories.set([]);
    this._selectedCategoryId.set(null);
    this._selectedDish.set(null);
    this._error.set(null);
    this._priceFilter.set(null);
    this._ratingFilter.set(null);
    this._onlyFavorites.set(false);
    this._searchQuery.set('');
    this._loadedRestaurantId.set(null);
    this._loadedCategoriesRestaurantId.set(null);
    this._lastDishesLoadTime.set(0);
    this._lastCategoriesLoadTime.set(0);
  }
  
  /**
   * Marcar/desmarcar un plato como favorito
   * En una app real, esto sería una llamada a la API
   */
  toggleFavorite(dishId: string): void {
    const dishes = this._dishes();
    const updatedDishes = dishes.map(dish => {
      if (dish.id === dishId) {
        // Simulamos el cambio de estado
        const isFavorite = (dish.favorites || 0) > 10; // Lógica simplificada para demo
        const favorites = (dish.favorites || 0) + (isFavorite ? -5 : 5);
        return { ...dish, favorites };
      }
      return dish;
    });
    
    this._dishes.set(updatedDishes);
    
    // Si el plato seleccionado es el que estamos cambiando, actualizarlo también
    if (this._selectedDish()?.id === dishId) {
      const selectedDish = this._selectedDish()!;
      const isFavorite = (selectedDish.favorites || 0) > 10;
      const favorites = (selectedDish.favorites || 0) + (isFavorite ? -5 : 5);
      this._selectedDish.set({ ...selectedDish, favorites });
    }
  }
}