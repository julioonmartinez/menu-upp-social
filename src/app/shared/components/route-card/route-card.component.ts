import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { GastronomicRoute } from '../../../core/models/route.model';

/**
 * Componente para mostrar una tarjeta de ruta gastronómica
 * 
 * Muestra la información principal de una ruta con una imagen, 
 * detalles básicos y opciones de interacción.
 */
@Component({
  selector: 'app-route-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './route-card.component.html',
  styleUrls: ['./route-card.component.scss']
})
export class RouteCardComponent {
  /**
   * Datos de la ruta a mostrar
   */
  @Input() route!: GastronomicRoute;
  
  /**
   * Si la tarjeta debe tener enlaces interactivos 
   */
  @Input() interactive = true;
  
  /**
   * Si se debe mostrar el creador de la ruta
   */
  @Input() showCreator = true;
  
  /**
   * Si se debe mostrar el estado de progreso
   */
  @Input() showProgress = true;
  
  /**
   * Tamaño de la tarjeta
   */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  
  /**
   * Formato de fecha en formato amigable
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const routeDate = new Date(date);
    return routeDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  /**
   * Calcula la duración en formato legible
   */
  formatDuration(minutes: number | undefined): string {
    if (!minutes) return '';
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    
    return `${hours} h ${remainingMinutes} min`;
  }
  
  /**
   * Devuelve la clase de dificultad
   */
  getDifficultyClass(): string {
    if (!this.route.difficulty) return '';
    
    switch (this.route.difficulty) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return '';
    }
  }
  
  /**
   * Devuelve la etiqueta de dificultad en español
   */
  getDifficultyLabel(): string {
    if (!this.route.difficulty) return '';
    
    switch (this.route.difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Media';
      case 'hard': return 'Difícil';
      default: return '';
    }
  }
}