import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProfileService } from '../../core/services/profile.service';
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
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);
  
  // Propiedades
  username = '';
  
  ngOnInit(): void {
    // Obtener el username de la URL
    this.route.paramMap.subscribe(params => {
      const usernameParams = params.get('username');
      if(usernameParams){
        this.username = usernameParams;
        this.loadProfileData();
      }
    });
  }
  
  /**
   * Carga los datos del perfil (restaurante o usuario)
   */
  loadProfileData(): void {
    console.log('ProfileLayoutComponent: Cargando perfil para username:', this.username);
    // Usar ProfileService en lugar de MockDataService directamente
    this.profileService.loadProfileByUsername(this.username);
  }
  
  /**
   * Seguir al restaurante o usuario
   */
  followProfile(): void {
    this.profileService.toggleFollow().subscribe(isFollowing => {
      console.log('Estado de seguimiento:', isFollowing ? 'Siguiendo' : 'No siguiendo');
    });
  }
  
  /**
   * Compartir perfil
   */
  shareProfile(): void {
    // Implementar lógica de compartir
    console.log('Compartiendo perfil:', this.username);
  }
  
  // Getters para acceder a la información del ProfileService
  get restaurant() {
    return this.profileService.currentRestaurant();
  }
  
  get user() {
    return this.profileService.currentUser();
  }
  
  get isRestaurant() {
    return this.profileService.profileType() === 'restaurant';
  }
  
  get isLoading() {
    return this.profileService.loading();
  }
  
  get profileName() {
    return this.profileService.currentProfileName();
  }
  
  get isFollowing() {
    return this.profileService.isFollowing();
  }
}