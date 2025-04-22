import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ProfileService } from '../../../../core/services/profile.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Schedule } from '../../../../core/models/restaurant.model';

/**
 * Componente para mostrar información detallada de un restaurante
 * 
 * Incluye horarios, dirección, características, tipo de cocina
 * y otra información relevante.
 */
@Component({
  selector: 'app-restaurant-info',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './restaurant-info.component.html',
  styleUrls: ['./restaurant-info.component.scss']
})
export class RestaurantInfoComponent implements OnInit, OnDestroy {
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
   * Formatea un día de la semana
   */
  formatDayName(day: string): string {
    const days: Record<string, string> = {
      'monday': 'Lunes',
      'tuesday': 'Martes',
      'wednesday': 'Miércoles',
      'thursday': 'Jueves',
      'friday': 'Viernes',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    
    return days[day] || day;
  }
  
  /**
   * Ordena los horarios por día de la semana
   */
  getOrderedSchedule(): Schedule[] {
    const schedule = this.restaurant?.schedule || [];
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return [...schedule].sort((a, b) => {
      return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    });
  }
  
  /**
   * Obtiene Google Maps URL para la ubicación
   */
  getGoogleMapsUrl(): string {
    const address = this.restaurant?.address;
    if (!address) return '';
    
    let query = '';
    
    if (address.coordinates?.lat && address.coordinates?.lng) {
      query = `${address.coordinates.lat},${address.coordinates.lng}`;
    } else {
      query = `${address.street} ${address.number || ''}, ${address.city}, ${address.country}`;
    }
    
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
  
  /**
   * Abre la dirección en Google Maps
   */
  openMaps(): void {
    const mapsUrl = this.getGoogleMapsUrl();
    if (mapsUrl) {
      window.open(mapsUrl, '_blank');
    }
  }
  
  // Getters
  
  get restaurant() {
    return this.profileService.currentRestaurant();
  }
  
  get restaurantAddress() {
    return this.restaurant?.address;
  }
  
  get formattedAddress(): string {
    const address = this.restaurantAddress;
    if (!address) return '';
    
    let parts = [];
    
    if (address.street) {
      parts.push(`${address.street}${address.number ? ` ${address.number}` : ''}`);
    }
    
    if (address.city) {
      parts.push(address.city);
    }
    
    if (address.state && address.postalCode) {
      parts.push(`${address.state}, ${address.postalCode}`);
    } else if (address.state) {
      parts.push(address.state);
    } else if (address.postalCode) {
      parts.push(address.postalCode);
    }
    
    if (address.country) {
      parts.push(address.country);
    }
    
    return parts.join('. ');
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
  
  get hasFeatures(): boolean {
    return !!this.restaurant?.features && this.restaurant.features.length > 0;
  }
  
  get hasCuisineTypes(): boolean {
    return !!this.restaurant?.cuisineType && this.restaurant.cuisineType.length > 0;
  }
  
  get hasSchedule(): boolean {
    return !!this.restaurant?.schedule && this.restaurant.schedule.length > 0;
  }
}