import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  username: string;
  image?: string;
  active: boolean;
  // Añade más propiedades según tu modelo
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiService = inject(ApiService);
  
  // Signals para estado reactivo
  restaurants = signal<Restaurant[]>([]);
  currentRestaurant = signal<Restaurant | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Obtener todos los restaurantes
  getRestaurants(): Observable<Restaurant[]> {
    this.loading.set(true);
    return this.apiService.get<Restaurant[]>('/restaurants').pipe(
      tap(data => {
        this.restaurants.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al cargar restaurantes');
        return throwError(() => error);
      })
    );
  }

  // Obtener restaurante por ID
  getRestaurantById(id: string): Observable<Restaurant> {
    this.loading.set(true);
    return this.apiService.get<Restaurant>(`/restaurants/${id}`).pipe(
      tap(data => {
        this.currentRestaurant.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al cargar el restaurante');
        return throwError(() => error);
      })
    );
  }

  // Obtener restaurante por username
  getRestaurantByUsername(username: string): Observable<Restaurant> {
    this.loading.set(true);
    return this.apiService.get<Restaurant>(`/restaurants/username/${username}`).pipe(
      tap(data => {
        this.currentRestaurant.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al cargar el restaurante');
        return throwError(() => error);
      })
    );
  }
}