import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantCardComponent } from '../restaurant-card/restaurant-card.component';
import { DishCardComponent } from '../../../../shared/components/dish-card/dish-card.component';
import { RouteCardComponent } from '../../../../shared/components/route-card/route-card.component';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [
    CommonModule,
    RestaurantCardComponent,
    DishCardComponent,
    RouteCardComponent
  ],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
  @Input() searchQuery: string = '';
  @Input() activeTab: 'restaurants' | 'dishes' | 'routes' = 'restaurants';
  @Input() searchResults: any[] = [];
  @Input() isLoading: boolean = false;
  
  @Output() clearSearch = new EventEmitter<void>();
  @Output() viewRestaurant = new EventEmitter<string>();
  @Output() favoriteClicked = new EventEmitter<string>();
  @Output() rateClicked = new EventEmitter<string>();
  
  /**
   * Maneja el clic en limpiar búsqueda
   */
  onClearSearch(): void {
    this.clearSearch.emit();
  }
  
  /**
   * Maneja el clic en ver restaurante
   */
  onViewRestaurant(username: string): void {
    this.viewRestaurant.emit(username);
  }
  
  /**
   * Maneja el clic en guardar restaurante
   */
  onSaveRestaurant(restaurantId: string): void {
    // Esta función podría implementarse si se necesita
    console.log('Guardar restaurante:', restaurantId);
  }
  
  /**
   * Maneja el clic en favorito de plato
   */
  onFavoriteClicked(dishId: string): void {
    this.favoriteClicked.emit(dishId);
  }
  
  /**
   * Maneja el clic en valorar plato
   */
  onRateClicked(dishId: string): void {
    this.rateClicked.emit(dishId);
  }
}