import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { Dish } from '../../../core/models/dish.model';

/**
 * Componente para mostrar un platillo en formato tarjeta
 * 
 * Muestra la información básica de un plato con imagen, nombre,
 * precio, valoración y acciones rápidas.
 */
@Component({
  selector: 'app-dish-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './dish-card.component.html',
  styleUrls: ['./dish-card.component.scss']
})
export class DishCardComponent {
  /**
   * Datos del plato a mostrar
   */
  @Input() dish!: Dish;
  
  /**
   * Si la tarjeta debe ser interactiva (clickable)
   */
  @Input() interactive = true;
  
  /**
   * Tamaño de la tarjeta
   */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  
  /**
   * Evento emitido al hacer clic en el botón de favorito
   */
  @Output() favoriteClicked = new EventEmitter<string>();
  
  /**
   * Evento emitido al hacer clic en el botón de valorar
   */
  @Output() rateClicked = new EventEmitter<string>();
  
  /**
   * Maneja clic en el botón de favorito
   */
  onFavoriteClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.favoriteClicked.emit(this.dish.id);
  }
  
  /**
   * Maneja clic en el botón de valorar
   */
  onRateClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.rateClicked.emit(this.dish.id);
  }
  
  /**
   * Comprueba si el plato está en favoritos
   * Implementación simplificada para demo
   */
  get isFavorite(): boolean {
    return (this.dish.favorites || 0) > 10;
  }
  
  /**
   * Formatea el precio con la moneda
   */
  formatPrice(): string {
    return `${this.dish.price.toFixed(2)} ${this.dish.currency || '€'}`;
  }
}