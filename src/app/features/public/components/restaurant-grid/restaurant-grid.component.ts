import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Restaurant } from '../../../../core/models/restaurant.model';
import { RestaurantCardComponent } from '../restaurant-card/restaurant-card.component';

@Component({
  selector: 'app-restaurant-grid',
  standalone: true,
  imports: [
    CommonModule,
    RestaurantCardComponent
  ],
  templateUrl: './restaurant-grid.component.html',
  styleUrls: ['./restaurant-grid.component.scss']
})
export class RestaurantGridComponent {
  // Inputs
  @Input() restaurants: Restaurant[] = [];
  @Input() isLoading: boolean = false;
  @Input() title: string = 'Restaurantes populares';
  
  // Outputs
  @Output() viewRestaurant = new EventEmitter<string>();
  @Output() saveRestaurant = new EventEmitter<string>();
  
  /**
   * Maneja el evento para ver el restaurante
   */
  onViewRestaurant(username: string): void {
    this.viewRestaurant.emit(username);
  }
  
  /**
   * Maneja el evento para guardar el restaurante
   */
  onSaveRestaurant(restaurantId: string): void {
    this.saveRestaurant.emit(restaurantId);
  }
}