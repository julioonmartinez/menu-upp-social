import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { DishCardComponent } from '../../../../shared/components/dish-card/dish-card.component';
import { RouteCardComponent } from '../../../../shared/components/route-card/route-card.component';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { Dish } from '../../../../core/models/dish.model';
import { Restaurant } from '../../../../core/models/restaurant.model';
import { GastronomicRoute } from '../../../../core/models/route.model';
import { Subject, debounceTime, takeUntil, forkJoin } from 'rxjs';
/**
 * Landing Page - Página de inicio pública con exploración funcional
 * 
 * Permite a los usuarios explorar restaurantes, platos y rutas
 * sin necesidad de registro previo.
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    ButtonComponent, 
    CardComponent, 
    DishCardComponent, 
    RouteCardComponent,

  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, OnDestroy {
  // Datos de exploración
  popularRestaurants: Restaurant[] = [];
  trendingDishes: Dish[] = [];
  popularRoutes: GastronomicRoute[] = [];
  private router = inject(Router)
  
  // Control de tabs
  activeTab: 'restaurants' | 'dishes' | 'routes' = 'restaurants';
  
  // Estado de búsqueda
  searchQuery = '';
  isSearching = false;
  searchResults: any[] = [];
  
  // Búsqueda rápida
  quickSearchQuery = '';
  quickSearchResults: {
    type: 'restaurant' | 'dish' | 'route',
    item: any
  }[] = [];
  showQuickSearch = false;
  private searchTerms = new Subject<string>();
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
  
  constructor(private mockDataService: MockDataService) {}
  
  ngOnInit() {
    this.loadRestaurants();
    this.loadDishes();
    this.loadRoutes();
    
    // Configurar observador de búsqueda rápida con debounce
    this.searchTerms.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.performQuickSearch(term);
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Carga los restaurantes populares
   */
/**
 * Carga los restaurantes populares ordenados por valoración
 */
loadRestaurants() {
  this.loading.restaurants = true;
  this.mockDataService.getRestaurants().subscribe({
    next: (restaurants) => {
      // Ordenar por valoración y popularidad
      const sortedRestaurants = restaurants.sort((a, b) => {
        // Primero por valoración si está disponible
        const ratingA = a.rating?.average || 0;
        const ratingB = b.rating?.average || 0;
        
        if (ratingA !== ratingB) {
          return ratingB - ratingA; // Mayor valoración primero
        }
        
        // Si tienen la misma valoración, ordenar por seguidores
        const followersA = a.followers || 0;
        const followersB = b.followers || 0;
        return followersB - followersA;
      });
      
      // Tomar los primeros 6
      this.popularRestaurants = sortedRestaurants.slice(0, 6);
      this.loading.restaurants = false;
      console.log(restaurants)
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
    this.mockDataService.getDishes().subscribe({
      next: (dishes) => {
        // Simulamos platos en tendencia (primeros 6)
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
    this.mockDataService.getRoutes().subscribe({
      next: (routes) => {
        // Simulamos rutas populares (primeras 6)
        this.popularRoutes = routes.slice(0, 6);
        this.loading.routes = false;
      },
      error: () => {
        this.loading.routes = false;
      }
    });
  }

  /**
 * Navega a la página del restaurante evitando la propagación del evento si viene del botón de CTA
 */
viewRestaurant(username: string, event?: Event): void {
  // Si se proporciona un evento, detener la propagación
  // Esto evita la navegación duplicada cuando se hace clic en el botón dentro de la card
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // Navegar a la página del perfil del restaurante
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
    
    // Buscar según el tab activo
    switch (this.activeTab) {
      case 'restaurants':
        this.mockDataService.searchRestaurants(query).subscribe({
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
        this.mockDataService.searchDishes(query).subscribe({
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
        this.mockDataService.searchRoutes(query).subscribe({
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
    this.searchTerms.next(query);
  }

  /**
   * Realiza la búsqueda rápida con los servicios
   */
  performQuickSearch(query: string) {
    this.quickSearchQuery = query;
    
    if (!query.trim()) {
      this.quickSearchResults = [];
      this.showQuickSearch = false;
      return;
    }
    
    this.showQuickSearch = true;
    this.loading.quickSearch = true;
    
    // Combinamos resultados de los tres tipos
    const restaurantSearch = this.mockDataService.searchRestaurants(query);
    const dishSearch = this.mockDataService.searchDishes(query);
    const routeSearch = this.mockDataService.searchRoutes(query);
    
    // Usar forkJoin para combinar los tres observables
    forkJoin([restaurantSearch, dishSearch, routeSearch]).subscribe({
      next: ([restaurants, dishes, routes]) => {
        // Combinar los resultados con sus tipos
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
    // Aquí podríamos navegar a la página del item seleccionado
    console.log('Seleccionado:', result);
    
    // También podríamos cambiar al tab correspondiente y hacer búsqueda
    if (result.type === 'restaurant') {
      this.activeTab = 'restaurants';
    } else if (result.type === 'dish') {
      this.activeTab = 'dishes';
    } else if (result.type === 'route') {
      this.activeTab = 'routes';
    }
    
    this.searchQuery = this.quickSearchQuery;
    this.onSearch(this.searchQuery);
    this.closeQuickSearch();
  }
  
  /**
   * Cierra la búsqueda rápida
   */
  closeQuickSearch() {
    this.showQuickSearch = false;
    this.quickSearchResults = [];
  }
  
  /**
   * Maneja el "favorito" de un plato
   * Como es landing, solo muestra mensaje por consola
   */
  onDishFavorite(dishId: string) {
    console.log('Añadir a favoritos requiere iniciar sesión', dishId);
    // Aquí podría mostrar un modal invitando a registrarse
  }
  
  /**
   * Maneja la "valoración" de un plato
   * Como es landing, solo muestra mensaje por consola
   */
  onDishRate(dishId: string) {
    console.log('Valorar un plato requiere iniciar sesión', dishId);
    // Aquí podría mostrar un modal invitando a registrarse
  }
}