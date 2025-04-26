import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';

import { ButtonComponent } from '../../shared/components/button/button.component';
import { ProfileService } from '../../core/services/profile.service';
import { Restaurant } from '../../core/models/restaurant.model';
import { SocialUser } from '../../core/models/user.model';

/**
 * Layout para perfiles públicos (restaurantes y usuarios)
 * 
 * Este componente actúa como contenedor para todas las vistas de perfil,
 * gestionando la carga inicial de datos y manteniendo la estructura común.
 */
@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './profile-layout.component.html',
  styleUrls: ['./profile-layout.component.scss']
})
export class ProfileLayoutComponent implements OnInit, OnDestroy {
  // Servicios
  private profileService = inject(ProfileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Propiedades
  username = '';
  hasInitialLoad = false;
  
  ngOnInit(): void {
    // Monitorear cambios en la ruta primaria (username)
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const usernameParam = params.get('username');
      if (usernameParam) {
        // Si es un nuevo username o es el primer cargado
        const isNewUsername = this.username !== usernameParam;
        this.username = usernameParam;
        
        if (isNewUsername) {
          console.log('ProfileLayout: Nuevo username detectado:', this.username);
          // Forzar recarga cuando cambia el username
          this.profileService.loadProfileByUsername(this.username, isNewUsername);
          this.hasInitialLoad = true;
        } else if (!this.hasInitialLoad) {
          // Primera carga para este username
          console.log('ProfileLayout: Carga inicial para username:', this.username);
          this.profileService.loadProfileByUsername(this.username);
          this.hasInitialLoad = true;
        }
      }
    });
    
    // Monitorear eventos de navegación para detectar cambios de ruta secundaria
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      const currentUrl = event.urlAfterRedirects || event.url;
      console.log('ProfileLayout: Navegación completada a', currentUrl);
      
      // Si ya tenemos el username cargado pero los datos no están disponibles
      // (posible pérdida de estado), recargamos
      if (this.username && !this.profileService.dataLoaded()) {
        console.log('ProfileLayout: Recuperando datos perdidos para:', this.username);
        this.profileService.loadProfileByUsername(this.username);
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Al salir del profile layout, podemos resetear completamente
    // Solo cuando realmente salimos del layout, no en navegaciones internas
    console.log('ProfileLayout: Componente destruido, haciendo resetProfile');
    this.profileService.resetProfile();
  }
  
  /**
   * Seguir al restaurante o usuario
   */
  followProfile(): void {
    if (this.isLoading) return;
    
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
    
    // En una app real, aquí se abriría un diálogo de compartir
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.profileName,
        text: `Visita el perfil de ${this.profileName} en MenuUPP`,
        url: url,
      })
      .catch((error) => console.log('Error compartiendo:', error));
    } else {
      // Fallback para navegadores que no soportan Web Share API
      console.log('Compartir no soportado, copiando URL al portapapeles');
      navigator.clipboard.writeText(url);
    }
  }
  
  /**
   * Recargar los datos del perfil manualmente
   */
  reloadProfile(): void {
    if (this.username) {
      this.profileService.loadProfileByUsername(this.username, true);
    }
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
  
  get isProfileLoaded() {
    return this.profileService.dataLoaded();
  }
}