import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuickSearchComponent } from '../quick-search/quick-search.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    QuickSearchComponent
  ],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent implements OnInit {
  // Inputs desde el componente padre
  @Input() searchQuery: string = '';
  @Input() showQuickSearch: boolean = false;
  @Input() quickSearchResults: any[] = [];
  @Input() isQuickSearchLoading: boolean = false;
  
  // Eventos emitidos al componente padre
  @Output() search = new EventEmitter<string>();
  @Output() quickSearch = new EventEmitter<string>();
  @Output() selectResult = new EventEmitter<any>();
  @Output() tagClick = new EventEmitter<string>();
  
  // Variables locales
  searchInputValue: string = '';
  searchTags: string[] = [
    'Restaurantes',
    'Comida vegana',
    'Rutas de tapas',
    'Cafeterías'
  ];
  
  ngOnInit(): void {
    // Sincronizar el valor de búsqueda con el input
    this.searchInputValue = this.searchQuery;
  }
  
  /**
   * Maneja el evento de búsqueda
   */
  handleSearch(): void {
    this.search.emit(this.searchInputValue);
  }
  
  /**
   * Maneja el evento de búsqueda rápida
   */
  handleQuickSearch(): void {
    this.quickSearch.emit(this.searchInputValue);
  }
  
  /**
   * Maneja la selección de un resultado de búsqueda rápida
   */
  handleSelectResult(result: any): void {
    this.selectResult.emit(result);
  }
  
  /**
   * Maneja el clic en una etiqueta de búsqueda
   */
  handleTagClick(tag: string): void {
    this.searchInputValue = tag;
    this.handleSearch();
  }
  
  /**
   * Obtiene el icono correspondiente a una etiqueta
   */
  getTagIcon(tag: string): string {
    switch (tag) {
      case 'Restaurantes':
        return 'fa-utensils';
      case 'Comida vegana':
        return 'fa-leaf';
      case 'Rutas de tapas':
        return 'fa-route';
      case 'Cafeterías':
        return 'fa-mug-hot';
      default:
        return 'fa-tag';
    }
  }
}