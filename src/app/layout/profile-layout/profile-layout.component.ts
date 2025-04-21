import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { Restaurant } from '../../core/models/restaurant.model';
import { SocialUser } from '../../core/models/user.model';

/**
 * Layout para perfiles públicos (restaurantes y usuarios)
 */
@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './profile-layout.component.html',
  styleUrls: ['./profile-layout.component.scss']
})
export class ProfileLayoutComponent implements OnInit {
  // Servicios
  private mockDataService = inject(MockDataService);
  private route = inject(ActivatedRoute);
  
  // Propiedades
  username = '';
  restaurant?: Restaurant;
  user?: SocialUser;
  isRestaurant = true;
  isLoading = true;
  
  ngOnInit(): void {
    // Obtener el username de la URL
    this.route.params.subscribe(params => {
      this.username = params['username'];
      this.loadProfileData();
    });
  }
  
  /**
   * Carga los datos del perfil (restaurante o usuario)
   */
  loadProfileData(): void {
    this.isLoading = true;
    
    // Intentar cargar como restaurante primero
    this.mockDataService.getRestaurantByUsername(this.username).subscribe(restaurant => {
      if (restaurant) {
        this.restaurant = restaurant;
        this.isRestaurant = true;
        this.isLoading = false;
      } else {
        // Si no es restaurante, intentar como usuario
        this.mockDataService.getUserByUsername(this.username).subscribe(user => {
          if (user) {
            this.user = user;
            this.isRestaurant = false;
            this.isLoading = false;
          } else {
            // No se encontró perfil
            this.isLoading = false;
            // Aquí se podría redirigir a una página de error
          }
        });
      }
    });
  }
  
  /**
   * Seguir al restaurante o usuario
   */
  followProfile(): void {
    // Implementar lógica de seguimiento
    console.log('Siguiendo perfil:', this.username);
  }
  
  /**
   * Compartir perfil
   */
  shareProfile(): void {
    // Implementar lógica de compartir
    console.log('Compartiendo perfil:', this.username);
  }
}