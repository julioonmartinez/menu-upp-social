import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';

/**
 * Layout para vistas de detalle (platos, posts, etc.)
 * 
 * Proporciona una estructura minimalista con un botón de retorno
 * y un contenedor para el contenido principal.
 */
@Component({
  selector: 'app-detail-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './detail-layout.component.html',
  styleUrls: ['./detail-layout.component.scss']
})
export class DetailLayoutComponent {
  constructor(private location: Location) {}
  
  /**
   * Navega hacia atrás en el historial del navegador
   */
  goBack(): void {
    this.location.back();
  }
}