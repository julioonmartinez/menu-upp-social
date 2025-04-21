import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { RoutesService } from '../../../../core/services/routes.service';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { GastronomicRoute } from '../../../../core/models/route.model';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { RouteCardComponent } from '../../../../shared/components/route-card/route-card.component';

/**
 * Página principal de rutas gastronómicas
 * 
 * Muestra el listado de rutas disponibles, filtros, y recomendaciones
 */
@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    CardComponent,
    RouteCardComponent
  ],
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.scss']
})
export class RoutesComponent implements OnInit {
  // Servicios
  private routesService = inject(RoutesService);
  private mockDataService = inject(MockDataService);
  
  // Datos de rutas
  tags: string[] = [];
  selectedTag: string | null = null;
  selectedDifficulty: string | null = null;
  
  // Opciones de dificultad
  difficultyOptions = [
    { value: 'easy', label: 'Fácil' },
    { value: 'medium', label: 'Media' },
    { value: 'hard', label: 'Difícil' }
  ];
  
  ngOnInit(): void {
    // Cargar todas las rutas
    this.routesService.loadRoutes();
    
    // Cargar etiquetas disponibles
    this.loadTags();
  }
  
  /**
   * Carga las etiquetas disponibles para filtrar
   */
  loadTags(): void {
    this.mockDataService.getRouteTags().subscribe(tags => {
      this.tags = tags;
    });
  }
  
  /**
   * Aplica filtro por etiqueta
   */
  filterByTag(tag: string | null): void {
    this.selectedTag = tag;
    this.routesService.setTagFilter(tag);
  }
  
  /**
   * Aplica filtro por dificultad
   */
  filterByDifficulty(difficulty: string | null): void {
    this.selectedDifficulty = difficulty;
    this.routesService.setDifficultyFilter(difficulty);
  }
  
  /**
   * Reinicia todos los filtros
   */
  resetFilters(): void {
    this.selectedTag = null;
    this.selectedDifficulty = null;
    this.routesService.setTagFilter(null);
    this.routesService.setDifficultyFilter(null);
  }
  
  /**
   * Señal computada de rutas filtradas
   */
  get routes(): GastronomicRoute[] {
    return this.routesService.filteredRoutes();
  }
  
  /**
   * Señal computada de rutas populares
   */
  get popularRoutes(): GastronomicRoute[] {
    return this.routesService.popularRoutes();
  }
  
  /**
   * Señal computada de rutas nuevas
   */
  get newRoutes(): GastronomicRoute[] {
    return this.routesService.newRoutes();
  }
  
  /**
   * Estado de carga
   */
  get loading(): boolean {
    return this.routesService.loading();
  }
  
  /**
   * Estado de error
   */
  get error(): string | null {
    return this.routesService.error();
  }
}