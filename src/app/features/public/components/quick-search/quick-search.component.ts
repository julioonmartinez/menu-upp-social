import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss']
})
export class QuickSearchComponent {
  // Inputs
  @Input() results: { type: string, item: any }[] = [];
  @Input() isLoading: boolean = false;
  
  // Outputs
  @Output() selectResult = new EventEmitter<any>();
  @Output() viewAllResults = new EventEmitter<void>();
  
  /**
   * Maneja la selección de un resultado
   */
  onSelectResult(result: any): void {
    this.selectResult.emit(result);
  }
  
  /**
   * Maneja el clic en "Ver todos los resultados"
   */
  onViewAllResults(): void {
    this.viewAllResults.emit();
  }
  
  /**
   * Obtiene la etiqueta para el tipo de resultado
   */
  getResultTypeLabel(type: string): string {
    switch (type) {
      case 'restaurant':
        return 'Restaurante';
      case 'dish':
        return 'Plato';
      case 'route':
        return 'Ruta gastronómica';
      default:
        return type;
    }
  }
}