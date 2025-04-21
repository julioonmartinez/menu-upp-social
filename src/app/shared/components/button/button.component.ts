import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente Button
 * 
 * Botón base para toda la aplicación con diferentes variantes, tamaños y estados.
 * 
 * @example
 * <app-button variant="primary" size="lg" (clicked)="onButtonClick()">
 *   Botón grande primario
 * </app-button>
 * 
 * <app-button variant="secondary" [disabled]="isDisabled" icon="fa-heart">
 *   Botón con ícono
 * </app-button>
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  /**
   * Variante del botón que determina su estilo visual
   */
  @Input() variant: 'primary' | 'secondary' | 'tertiary' = 'primary';
  
  /**
   * Tamaño del botón
   */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  
  /**
   * Si el botón está deshabilitado
   */
  @Input() disabled = false;
  
  /**
   * Muestra un indicador de carga en el botón
   */
  @Input() loading = false;
  
  /**
   * Nombre del icono de Font Awesome (sin 'fa-')
   * @example icon="heart" mostrará "fa-heart"
   */
  @Input() icon?: string;
  
  /**
   * Posición del icono respecto al texto
   */
  @Input() iconPosition: 'left' | 'right' = 'left';
  
  /**
   * Hace que el botón ocupe todo el ancho disponible
   */
  @Input() fullWidth = false;
  
  /**
   * Tipo de botón HTML
   */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  
  /**
   * Evento emitido al hacer clic en el botón
   */
  @Output() clicked = new EventEmitter<void>();
  
  /**
   * Manejador del evento click
   * Emite el evento solo si el botón no está deshabilitado o cargando
   */
  onClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
  
  /**
   * Devuelve la clase completa del icono incluyendo el prefijo 'fa-'
   */
  get iconClass(): string {
    if (!this.icon) return '';
    
    // Detectar si el icono ya incluye el prefijo (fa-solid, fa-regular, etc.)
    if (this.icon.startsWith('fa-')) {
      return this.icon;
    }
    
    // De lo contrario, usar fa-solid como prefijo predeterminado
    return `fa-solid fa-${this.icon}`;
  }
}