import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { Restaurant } from '../../../../core/models/restaurant.model';
import { Dish } from '../../../../core/models/dish.model';
import { GastronomicRoute } from '../../../../core/models/route.model';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { DishCardComponent } from '../../../../shared/components/dish-card/dish-card.component';
import { RouteCardComponent } from '../../../../shared/components/route-card/route-card.component';

/**
 * Componente de Búsqueda
 * 
 * Permite buscar restaurantes, platos y rutas gastronómicas
 */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    CardComponent,
    ButtonComponent,
    InputComponent,
    DishCardComponent,
    RouteCardComponent
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  // Servicios
  private mockDataService = inject(MockDataService);
  
  // Estado de búsqueda
  searchQuery = signal<string>('');
  searchType = signal<'all' | 'restaurants' | 'dishes' | 'routes'>('all');
  
  // Resultados
  restaurants = signal<Restaurant[]>([]);
  dishes = signal<Dish[]>([]);
  routes = signal<GastronomicRoute[]>([]);
  
  // Estados
  isSearching = signal<boolean>(false);
  hasSearched = signal<boolean>(false);
  error = signal<string | null>(null);
  
  /**
   * Realiza la búsqueda cuando se envía el formulario
   */
  onSearch(): void {
    const query = this.searchQuery();
    
    if (!query.trim()) {
      return;
    }
    
    this.isSearching.set(true);
    this.error.set(null);
    this.hasSearched.set(true);
    
    const type = this.searchType();
    
    // Resetear resultados
    this.restaurants.set([]);
    this.dishes.set([]);
    this.routes.set([]);
    
    // Realizar búsquedas según el tipo seleccionado
    if (type === 'all' || type === 'restaurants') {
      this.searchRestaurants(query);
    }
    
    if (type === 'all' || type === 'dishes') {
      this.searchDishes(query);
    }
    
    if (type === 'all' || type === 'routes') {
      this.searchRoutes(query);
    }
  }
  
  /**
   * Búsqueda de restaurantes
   */
  private searchRestaurants(query: string): void {
    this.mockDataService.searchRestaurants(query).subscribe({
      next: (results) => {
        this.restaurants.set(results);
        this.checkSearchCompletion();
      },
      error: (err) => {
        console.error('Error searching restaurants', err);
        this.error.set('Error al buscar restaurantes');
        this.checkSearchCompletion();
      }
    });
  }
  
  /**
   * Búsqueda de platos
   */
  private searchDishes(query: string): void {
    this.mockDataService.searchDishes(query).subscribe({
      next: (results) => {
        this.dishes.set(results);
        this.checkSearchCompletion();
      },
      error: (err) => {
        console.error('Error searching dishes', err);
        this.error.set('Error al buscar platos');
        this.checkSearchCompletion();
      }
    });
  }
  
  /**
   * Búsqueda de rutas
   */
  private searchRoutes(query: string): void {
    this.mockDataService.searchRoutes(query).subscribe({
      next: (results) => {
        this.routes.set(results);
        this.checkSearchCompletion();
      },
      error: (err) => {
        console.error('Error searching routes', err);
        this.error.set('Error al buscar rutas');
        this.checkSearchCompletion();
      }
    });
  }
  
  /**
   * Comprueba si todas las búsquedas han terminado
   */
  private checkSearchCompletion(): void {
    const type = this.searchType();
    let completed = false;
    
    if (type === 'restaurants') {
      completed = true;
    } else if (type === 'dishes') {
      completed = true;
    } else if (type === 'routes') {
      completed = true;
    } else if (type === 'all') {
      // Todas las búsquedas deben estar completas
      completed = true;
    }
    
    if (completed) {
      this.isSearching.set(false);
    }
  }
  
  /**
   * Cambia el tipo de búsqueda
   */
  setSearchType(type: 'all' | 'restaurants' | 'dishes' | 'routes'): void {
    this.searchType.set(type);
    
    if (this.hasSearched()) {
      this.onSearch(); // Realizar nueva búsqueda si ya se había buscado antes
    }
  }
  
  /**
   * Comprueba si hay resultados
   */
  get hasResults(): boolean {
    return this.restaurants().length > 0 || this.dishes().length > 0 || this.routes().length > 0;
  }
  
  /**
   * Comprueba si un tipo de búsqueda está activo
   */
  isSearchTypeActive(type: string): boolean {
    return this.searchType() === type;
  }
  
  /**
   * Manejador para marcar un plato como favorito
   */
  onDishFavorite(dishId: string): void {
    console.log('Marked dish as favorite:', dishId);
  }
  
  /**
   * Manejador para valorar un plato
   */
  onDishRate(dishId: string): void {
    console.log('Rate dish:', dishId);
  }
  
  /**
   * Limpia los resultados de búsqueda
   */
  clearSearch(): void {
    this.searchQuery.set('');
    this.hasSearched.set(false);
    this.restaurants.set([]);
    this.dishes.set([]);
    this.routes.set([]);
    this.error.set(null);
  }
}