import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { ButtonComponent } from '../button/button.component';
import { RouteCompletionStatus, RouteStop } from '../../../core/models/route.model';

/**
 * Componente para mostrar y gestionar el progreso de una ruta gastronómica
 * 
 * Muestra el estado actual de completado de una ruta, permitiendo marcar
 * paradas como completadas y seguir el progreso.
 */
@Component({
  selector: 'app-route-progress',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  templateUrl: './route-progress.component.html',
  styleUrls: ['./route-progress.component.scss']
})
export class RouteProgressComponent {
  /**
   * Estado de completado de la ruta
   */
  @Input() completionStatus!: RouteCompletionStatus;
  
  /**
   * Paradas de la ruta
   */
  @Input() stops: RouteStop[] = [];
  
  /**
   * Estado de carga para operaciones
   */
  @Input() loading = false;
  
  /**
   * Evento emitido cuando se inicia la ruta
   */
  @Output() startRoute = new EventEmitter<void>();
  
  /**
   * Evento emitido cuando se completa una parada
   */
  @Output() completeStop = new EventEmitter<string>();
  
  /**
   * Inicia la ruta
   */
  onStartRoute(): void {
    this.startRoute.emit();
  }
  
  /**
   * Marca una parada como completada
   */
  onCompleteStop(stopId: string): void {
    this.completeStop.emit(stopId);
  }
  
  /**
   * Comprueba si todas las paradas están completadas
   */
  get isCompleted(): boolean {
    return this.completionStatus?.completedDate !== undefined;
  }
  
  /**
   * Comprueba si la ruta ha sido iniciada
   */
  get isStarted(): boolean {
    return this.completionStatus?.isStarted === true;
  }
  
  /**
   * Formatea la fecha en formato legible
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const routeDate = new Date(date);
    return routeDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**
   * Obtiene el mensaje de estado según el progreso
   */
  getStatusMessage(): string {
    if (!this.isStarted) {
      return '¡Comienza esta ruta gastronómica!';
    }
    
    if (this.isCompleted) {
      return '¡Enhorabuena! Has completado esta ruta';
    }
    
    const pending = this.completionStatus.totalStops - this.completionStatus.completedStops;
    return `¡Continúa la aventura! Te ${pending === 1 ? 'queda' : 'quedan'} ${pending} ${pending === 1 ? 'parada' : 'paradas'}`;
  }
}