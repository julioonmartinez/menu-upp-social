import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardComponent } from '../../../../shared/components/card/card.component';

/**
 * Privacy Component
 * 
 * Componente para mostrar la política de privacidad de la plataforma
 */
@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent {
  // Fecha de última actualización
  lastUpdated = '15 de Enero, 2025';
}