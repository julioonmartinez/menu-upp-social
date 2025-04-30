import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Restaurant } from '../../../../core/models/restaurant.model';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './restaurant-card.component.html',
  styleUrls: ['./restaurant-card.component.scss']
})
export class RestaurantCardComponent {
  @Input() restaurant!: Restaurant;
  
  @Output() saveClicked = new EventEmitter<string>();
  @Output() viewMenuClicked = new EventEmitter<string>();
  
  /**
   * Maneja clic en botón de guardar
   */
  onSaveClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.saveClicked.emit(this.restaurant.id);
  }
  
  /**
   * Maneja clic en botón de ver menú
   */
  onViewMenuClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.viewMenuClicked.emit(this.restaurant.id);
  }
  
  /**
   * Obtiene la URL de la imagen de portada o una predeterminada
   */
  getCoverImageUrl(): string {
    return this.restaurant.coverImage?.url || '/assets/images/default-cover.jpg';
  }
  
  /**
   * Obtiene la URL del logo o una predeterminada
   */
  getLogoUrl(): string {
    return this.restaurant.logo?.url || '/assets/images/placeholder-profile.jpg';
  }
  
  /**
   * Formatea la valoración con un decimal
   */
  formatRating(rating?: number): string {
    if (!rating) return '0.0';
    return rating.toFixed(1);
  }
  
  /**
   * Obtiene la clase de icono según el tipo de característica
   */
  getFeatureIconClass(feature: string): string {
    switch (feature) {
      case 'Terraza': return 'fa-umbrella-beach';
      case 'WiFi': return 'fa-wifi';
      case 'Estacionamiento': return 'fa-square-parking';
      case 'Tarjetas': return 'fa-credit-card';
      case 'Área infantil': return 'fa-baby';
      case 'Música en vivo': return 'fa-music';
      default: return 'fa-check';
    }
  }
}