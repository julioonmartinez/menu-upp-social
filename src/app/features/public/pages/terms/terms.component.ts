import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../../shared/components/card/card.component';

/**
 * Terms Component
 * 
 * Componente para mostrar los términos y condiciones de la plataforma
 */
@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent {
  // Fecha de última actualización
  lastUpdated = '15 de Enero, 2025';
}