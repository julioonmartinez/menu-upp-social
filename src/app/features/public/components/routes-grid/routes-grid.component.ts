import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GastronomicRoute } from '../../../../core/models/route.model';
import { RouteCardComponent } from '../../../../shared/components/route-card/route-card.component';

@Component({
  selector: 'app-routes-grid',
  standalone: true,
  imports: [
    CommonModule,
    RouteCardComponent
  ],
  templateUrl: './routes-grid.component.html',
  styleUrls: ['./routes-grid.component.scss']
})
export class RoutesGridComponent {
  @Input() routes: GastronomicRoute[] = [];
  @Input() isLoading: boolean = false;
  @Input() title: string = 'Rutas gastronómicas populares';
  
  @Output() routeClicked = new EventEmitter<string>();
  
  /**
   * Maneja el clic en una ruta
   */
  onRouteClicked(routeId: string): void {
    this.routeClicked.emit(routeId);
  }
}