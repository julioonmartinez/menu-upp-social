import { Component, ContentChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente Card
 * 
 * Card base para toda la aplicación con diferentes variantes y estilos.
 * 
 * @example
 * <app-card>
 *   Contenido básico de la card
 * </app-card>
 * 
 * <app-card variant="elevated" [hoverable]="true">
 *   <ng-container slot="header">Cabecera de la card</ng-container>
 *   Contenido de la card
 *   <ng-container slot="footer">Pie de la card</ng-container>
 * </app-card>
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  /**
   * Variante de la card que determina su estilo visual
   */
  @Input() variant: 'flat' | 'elevated' | 'outlined' = 'flat';
  
  /**
   * Si la card debe mostrar efectos al pasar el cursor
   */
  @Input() hoverable = false;
  
  /**
   * Padding interno de la card
   */
  @Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';
  
  /**
   * Radio de borde de la card
   */
  @Input() borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  
  /**
   * Si la card debe ocupar todo el ancho disponible
   */
  @Input() fullWidth = true;
  
  /**
   * Altura fija de la card (en px o cualquier unidad CSS válida)
   */
  @Input() height?: string;
  
  /**
   * Verificar si la card tiene contenido en el slot de header
   */
  @ContentChild('header') headerContent: any;
  
  /**
   * Verificar si la card tiene contenido en el slot de footer
   */
  @ContentChild('footer') footerContent: any;
  
  /**
   * Verificar si la card tiene header
   */
  get cardHasHeader(): boolean {
    return !!this.headerContent;
  }
  
  /**
   * Verificar si la card tiene footer
   */
  get cardHasFooter(): boolean {
    return !!this.footerContent;
  }
}