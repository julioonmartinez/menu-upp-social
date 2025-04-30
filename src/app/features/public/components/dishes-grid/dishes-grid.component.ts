import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dish } from '../../../../core/models/dish.model';
import { DishCardComponent } from '../../../../shared/components/dish-card/dish-card.component';

@Component({
  selector: 'app-dishes-grid',
  standalone: true,
  imports: [
    CommonModule,
    DishCardComponent
  ],
  templateUrl: './dishes-grid.component.html',
  styleUrls: ['./dishes-grid.component.scss']
})
export class DishesGridComponent {
  @Input() dishes: Dish[] = [];
  @Input() isLoading: boolean = false;
  @Input() title: string = 'Platos en tendencia';
  
  @Output() favoriteClicked = new EventEmitter<string>();
  @Output() rateClicked = new EventEmitter<string>();
  
  /**
   * Maneja el clic en favorito
   */
  onFavoriteClicked(dishId: string): void {
    this.favoriteClicked.emit(dishId);
  }
  
  /**
   * Maneja el clic en valorar
   */
  onRateClicked(dishId: string): void {
    this.rateClicked.emit(dishId);
  }
}