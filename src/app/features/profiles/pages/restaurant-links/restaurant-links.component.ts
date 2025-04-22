import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ProfileService } from '../../../../core/services/profile.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { SocialLink } from '../../../../core/models/restaurant.model';

/**
 * Componente para mostrar los enlaces sociales y externos de un restaurante
 * 
 * Muestra todos los enlaces del restaurante agrupados por categoría
 * y permite acceder directamente a ellos.
 */
@Component({
  selector: 'app-restaurant-links',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './restaurant-links.component.html',
  styleUrls: ['./restaurant-links.component.scss']
})
export class RestaurantLinksComponent implements OnInit, OnDestroy {
  // Servicios
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    // Obtener el username de la ruta
    this.route.parent?.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const username = params['username'];
      if (username) {
        this.profileService.loadProfileByUsername(username);
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Obtiene el icono para la plataforma
   */
  getPlatformIcon(platform: string): string {
    const icons: Record<string, string> = {
      'instagram': 'fa-brands fa-instagram',
      'facebook': 'fa-brands fa-facebook',
      'twitter': 'fa-brands fa-twitter',
      'tiktok': 'fa-brands fa-tiktok',
      'website': 'fa-solid fa-globe',
      'other': 'fa-solid fa-link'
    };
    
    return icons[platform] || 'fa-solid fa-link';
  }
  
  /**
   * Obtiene el nombre de la plataforma
   */
  getPlatformName(platform: string): string {
    const names: Record<string, string> = {
      'instagram': 'Instagram',
      'facebook': 'Facebook',
      'twitter': 'Twitter',
      'tiktok': 'TikTok',
      'website': 'Sitio Web',
      'other': 'Enlace Externo'
    };
    
    return names[platform] || 'Enlace';
  }
  
  /**
   * Formatea una URL para mostrar
   */
  formatUrl(url: string): string {
    return url.replace(/^https?:\/\/(www\.)?/i, '');
  }
  
  /**
   * Abre un enlace externo
   */
  openLink(url: string): void {
    // En una app real, esto abriría una nueva ventana
    window.open(url, '_blank');
  }
  
  // Getters
  
  get restaurant() {
    return this.profileService.currentRestaurant();
  }
  
  get socialLinks(): SocialLink[] {
    return this.restaurant?.socialLinks || [];
  }
  
  get hasWebsite(): boolean {
    return !!this.restaurant?.contact?.website;
  }
  
  get websiteUrl(): string {
    return this.restaurant?.contact?.website || '';
  }
  
  get contactEmail(): string {
    return this.restaurant?.contact?.email || '';
  }
  
  get contactPhone(): string {
    return this.restaurant?.contact?.phone || '';
  }
  
  get restaurantUsername(): string {
    return this.profileService.currentProfileUsername();
  }
  
  get loading(): boolean {
    return this.profileService.loading();
  }
  
  get error(): string | null {
    return this.profileService.error();
  }
  
  get isRestaurant(): boolean {
    return this.profileService.profileType() === 'restaurant';
  }
}