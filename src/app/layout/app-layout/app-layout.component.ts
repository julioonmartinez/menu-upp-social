import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';

/**
 * Layout principal para la sección de aplicación autenticada
 * 
 * Este layout incluye el header, bottom navigation en móvil,
 * sidebar en desktop y el contenedor principal de contenido.
 */
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent {
  /**
   * Opciones del menú principal
   */
  menuItems = [
    {
      label: 'Explorar',
      icon: 'compass',
      route: '/app/explore'
    },
    {
      label: 'Rutas',
      icon: 'route',
      route: '/app/routes'
    },
    {
      label: 'Pasaporte',
      icon: 'passport',
      route: '/app/passport'
    },
    {
      label: 'Buscar',
      icon: 'magnifying-glass',
      route: '/app/search'
    },
    {
      label: 'Perfil',
      icon: 'user',
      route: '/app/profile'
    }
  ];
  
  /**
   * Mock de notificaciones para indicador de notificación
   */
  notificationCount = 3;
  
  /**
   * Estado de la barra lateral en formato móvil/tablet
   */
  isSidebarOpen = false;
  
  /**
   * Toggle del estado de la barra lateral
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}