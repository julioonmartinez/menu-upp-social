import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../card/card.component';
import { DishReview } from '../../../core/models/dish.model';

/**
 * Componente para mostrar una reseña
 * 
 * Muestra información detallada de una reseña con valoración,
 * comentario, acciones y datos del usuario.
 */
@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss']
})
export class ReviewCardComponent {
  /**
   * Datos de la reseña a mostrar
   */
  @Input() review!: DishReview;
  
  /**
   * Estilo de visualización
   */
  @Input() variant: 'default' | 'compact' = 'default';
  
  /**
   * Evento emitido al hacer clic en "Me gusta"
   */
  @Output() likeClicked = new EventEmitter<string>();
  
  /**
   * Evento emitido al hacer clic en "Responder"
   */
  @Output() replyClicked = new EventEmitter<string>();
  
  /**
   * Maneja clic en "Me gusta"
   */
  onLikeClick(): void {
    this.likeClicked.emit(this.review.id);
  }
  
  /**
   * Maneja clic en "Responder"
   */
  onReplyClick(): void {
    this.replyClicked.emit(this.review.id);
  }
  
  /**
   * Formatea la fecha en formato legible
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const reviewDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - reviewDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      // Menos de un día
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) {
        // Menos de una hora
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `Hace ${diffMinutes} min`;
      }
      return `Hace ${diffHours} h`;
    } else if (diffDays < 7) {
      // Menos de una semana
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else if (diffDays < 30) {
      // Menos de un mes
      const diffWeeks = Math.floor(diffDays / 7);
      return `Hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
    } else {
      // Más de un mes, mostramos la fecha completa
      return reviewDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
}