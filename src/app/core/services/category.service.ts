import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  description: string;
  restaurantId: string;
  // Añade más propiedades según tu modelo
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiService = inject(ApiService);
  
  // Signals para estado reactivo
  categories = signal<Category[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Obtener categorías por ID de restaurante
  getCategoriesByRestaurantId(restaurantId: string): Observable<Category[]> {
    this.loading.set(true);
    return this.apiService.get<Category[]>(`/categories?restaurant_id=${restaurantId}`).pipe(
      tap(data => {
        this.categories.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al cargar categorías');
        return throwError(() => error);
      })
    );
  }

  // Obtener categorías por username de restaurante
  getCategoriesByRestaurantUsername(username: string): Observable<Category[]> {
    this.loading.set(true);
    return this.apiService.get<Category[]>(`/categories/restaurant-username/${username}`).pipe(
      tap(data => {
        this.categories.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al cargar categorías');
        return throwError(() => error);
      })
    );
  }
}