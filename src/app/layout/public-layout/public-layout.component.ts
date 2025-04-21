import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';

/**
 * Layout para la sección pública (landing, login, registro)
 */
@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
})
export class PublicLayoutComponent {    
 // Año actual para el copyright
 currentYear = new Date().getFullYear();
  
 // Métodos de navegación a login/registro
 navigateToLogin() {
   // Implementar si se necesita lógica adicional antes de navegar
 }
 
 navigateToRegister() {
   // Implementar si se necesita lógica adicional antes de navegar
 }
}