import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Servicios y modelos
import { MockDataService } from '../../../../core/services/mock-data.service';
import { Dish } from '../../../../core/models/dish.model';
import { Restaurant } from '../../../../core/models/restaurant.model';
import { GastronomicRoute } from '../../../../core/models/route.model';

// Componentes modulares
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { ExploreTabsComponent } from '../../components/explore-tabs/explore-tabs.component';
import { SearchResultsComponent } from '../../components/search-results/search-results.component';
import { RestaurantGridComponent } from '../../components/restaurant-grid/restaurant-grid.component';
import { DishesGridComponent } from '../../components/dishes-grid/dishes-grid.component';
import { RoutesGridComponent } from '../../components/routes-grid/routes-grid.component';
import { RegistrationSidebarComponent } from '../../components/registration-sidebar/registration-sidebar.component';
import { RestaurantService } from '../../../../core/services/restaurant.service';
import { RestaurantAdapterService } from '../../../../core/services/restaurant-adapter.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    // Componentes modulares
    HeroSectionComponent,
    ExploreTabsComponent,
    SearchResultsComponent,
    RestaurantGridComponent,
    DishesGridComponent,
    RegistrationSidebarComponent,
    RoutesGridComponent
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {

  //inyección de dependencias
  restaurantService = inject(RestaurantService);
  restaurantAdapter = inject(RestaurantAdapterService);
  // Datos de exploración
  popularRestaurants: Restaurant[] = [];
  trendingDishes: Dish[] = [];
  popularRoutes: GastronomicRoute[] = [];
  dishes: Dish[] = [];
  // Control de tabs
  activeTab: 'restaurants' | 'dishes' | 'routes' = 'restaurants';
  
  // Estado de búsqueda
  searchQuery = '';
  
  isSearching = false;
  searchResults: any[] = [];
  
  // Búsqueda rápida
  quickSearchResults: {
    type: 'restaurant' | 'dish' | 'route',
    item: any
  }[] = [];
  showQuickSearch = false;
  private destroy$ = new Subject<void>();
  
  // Estado de carga
  loading = {
    restaurants: false,
    dishes: false,
    routes: false,
    search: false,
    quickSearch: false
  };

  // Estadísticas de la plataforma
  stats = [
    { value: '2,500+', label: 'Restaurantes' },
    { value: '15,000+', label: 'Usuarios activos' },
    { value: '850+', label: 'Rutas creadas' },
    { value: '45,000+', label: 'Reseñas' }
  ];
  
  constructor(
    private mockDataService: MockDataService,
    private router: Router
  ) {
    this.restaurantService.getRestaurants().subscribe({
      next: (backendRestaurants) => {
        // Usar el adaptador para convertir los datos
        this.popularRestaurants = this.restaurantAdapter.adaptRestaurants(backendRestaurants);
        this.loading.restaurants = false;
        console.log('Restaurantes backend:', backendRestaurants);
        console.log('Restaurantes adaptados:', this.popularRestaurants);
      },
      error: (error) => {
        console.error('Error cargando restaurantes:', error);
        this.loading.restaurants = false;
      }
    });
  }
  
  ngOnInit() {
    // this.loadRestaurants();
    this.loadDishes();
    this.loadRoutes();
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Carga los restaurantes populares
   */
  loadRestaurants() {
    this.loading.restaurants = true;
    this.mockDataService.getRestaurants()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (restaurants) => {
          // Ordenar por valoración y popularidad
          const sortedRestaurants = restaurants.sort((a, b) => {
            const ratingA = a.rating?.average || 0;
            const ratingB = b.rating?.average || 0;
            
            if (ratingA !== ratingB) {
              return ratingB - ratingA; // Mayor valoración primero
            }
            
            const followersA = a.followers || 0;
            const followersB = b.followers || 0;
            return followersB - followersA;
          });
          
          this.popularRestaurants = sortedRestaurants.slice(0, 6);
          this.loading.restaurants = false;
        },
        error: () => {
          this.loading.restaurants = false;
        }
      });
  }
  
  /**
   * Carga los platos en tendencia
   */
  loadDishes() {
    this.loading.dishes = true;
    this.mockDataService.getDishes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dishes) => {
          this.trendingDishes = dishes.slice(0, 6);
          this.loading.dishes = false;
        },
        error: () => {
          this.loading.dishes = false;
        }
      });
  }
  
  /**
   * Carga las rutas populares
   */
  loadRoutes() {
    this.loading.routes = true;
    this.mockDataService.getRoutes()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (routes) => {
          this.popularRoutes = routes.slice(0, 6);
          this.loading.routes = false;
        },
        error: () => {
          this.loading.routes = false;
        }
      });
  }

  /**
   * Navega a la página del restaurante
   */
  viewRestaurant(username: string): void {
    this.router.navigate(['/profile', username]);
  }
  
  /**
   * Cambia el tab activo
   */
  setActiveTab(tab: 'restaurants' | 'dishes' | 'routes') {
    this.activeTab = tab;
  }
  
  /**
   * Realiza una búsqueda en la plataforma
   */
  onSearch(query: string) {
    if (!query.trim()) {
      this.isSearching = false;
      return;
    }
    
    this.searchQuery = query;
    this.isSearching = true;
    this.loading.search = true;
    
    // Búsqueda según el tab activo
    switch (this.activeTab) {
      case 'restaurants':
        this.mockDataService.searchRestaurants(query)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (results) => {
              this.searchResults = results;
              this.loading.search = false;
            },
            error: () => {
              this.loading.search = false;
            }
          });
        break;
        
      case 'dishes':
        this.mockDataService.searchDishes(query)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (results) => {
              this.searchResults = results;
              this.loading.search = false;
            },
            error: () => {
              this.loading.search = false;
            }
          });
        break;
        
      case 'routes':
        this.mockDataService.searchRoutes(query)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (results) => {
              this.searchResults = results;
              this.loading.search = false;
            },
            error: () => {
              this.loading.search = false;
            }
          });
        break;
    }
  }
  
  /**
   * Cancela la búsqueda
   */
  clearSearch() {
    this.searchQuery = '';
    this.isSearching = false;
    this.searchResults = [];
  }

  /**
   * Actualiza los términos de búsqueda rápida
   */
  onQuickSearch(query: string) {
    if (!query.trim()) {
      this.quickSearchResults = [];
      this.showQuickSearch = false;
      return;
    }
    
    this.showQuickSearch = true;
    this.loading.quickSearch = true;
    
    // Búsqueda rápida en los tres tipos
    const restaurantSearch = this.mockDataService.searchRestaurants(query);
    const dishSearch = this.mockDataService.searchDishes(query);
    const routeSearch = this.mockDataService.searchRoutes(query);
    
    forkJoin([restaurantSearch, dishSearch, routeSearch])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([restaurants, dishes, routes]) => {
          this.quickSearchResults = [
            ...restaurants.slice(0, 3).map(item => ({ type: 'restaurant' as const, item })),
            ...dishes.slice(0, 3).map(item => ({ type: 'dish' as const, item })),
            ...routes.slice(0, 3).map(item => ({ type: 'route' as const, item }))
          ];
          this.loading.quickSearch = false;
        },
        error: () => {
          this.loading.quickSearch = false;
        }
      });
  }
  
  /**
   * Selecciona un resultado de la búsqueda rápida
   */
  selectQuickSearchResult(result: any) {
    if (result.type === 'restaurant') {
      this.activeTab = 'restaurants';
    } else if (result.type === 'dish') {
      this.activeTab = 'dishes';
    } else if (result.type === 'route') {
      this.activeTab = 'routes';
    }
    
    this.searchQuery = result.item.name;
    this.onSearch(this.searchQuery);
    this.showQuickSearch = false;
  }
  
  /**
   * Maneja el "favorito" de un plato
   */
  onDishFavorite(dishId: string) {
    console.log('Añadir a favoritos requiere iniciar sesión', dishId);
  }
  
  /**
   * Maneja la "valoración" de un plato
   */
  onDishRate(dishId: string) {
    console.log('Valorar un plato requiere iniciar sesión', dishId);
  }
}