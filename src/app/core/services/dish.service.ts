import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  rating: number;
  reviewsCount: number;
  favorites: number;
  categoryId: string;
  restaurantId: string;
  // Añade más propiedades según tu modelo
}

export interface DishesResponse {
  dishes: Dish[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DishService {
  private apiService = inject(ApiService);
  
  // Signals para estado reactivo
  dishes = signal<Dish[]>([]);
  currentDish = signal<Dish | null>(null);
  pagination = signal<any | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Obtener platillos filtrados
  getDishes(params: any = {}): Observable<DishesResponse> {
    this.loading.set(true);
    return this.apiService.get<DishesResponse>('/dishes', params).pipe(
      tap(data => {
        this.dishes.set(data.dishes);
        this.pagination.set(data.pagination);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al cargar platillos');
        return throwError(() => error);
      })
    );
  }

  // Obtener platillos por ID de restaurante
  getDishesByRestaurantId(restaurantId: string, page = 1, limit = 20): Observable<DishesResponse> {
    return this.getDishes({ restaurant_id: restaurantId, page, limit });
  }

  // Obtener platillos por username de restaurante
  getDishesByRestaurantUsername(username: string, page = 1, limit = 20): Observable<DishesResponse> {
    this.loading.set(true);
    return this.apiService.get<DishesResponse>(`/dishes/restaurant-username/${username}`, { page, limit }).pipe(
      tap(data => {
        this.dishes.set(data.dishes);
        this.pagination.set(data.pagination);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al cargar platillos');
        return throwError(() => error);
      })
    );
  }

  // Obtener platillos por username de restaurante y categoría
  getDishesByRestaurantUsernameAndCategory(username: string, categoryId: string, page = 1, limit = 20): Observable<DishesResponse> {
    this.loading.set(true);
    return this.apiService.get<DishesResponse>(
      `/dishes/restaurant-username/${username}/category/${categoryId}`, 
      { page, limit }
    ).pipe(
      tap(data => {
        this.dishes.set(data.dishes);
        this.pagination.set(data.pagination);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al cargar platillos');
        return throwError(() => error);
      })
    );
  }

  // Obtener platillo por ID
  getDishById(id: string): Observable<Dish> {
    this.loading.set(true);
    return this.apiService.get<Dish>(`/dishes/${id}`).pipe(
      tap(data => {
        this.currentDish.set(data);
        this.loading.set(false);
        this.error.set(null);
      }),
      catchError(error => {
        this.loading.set(false);
        this.error.set(error.message || 'Error al cargar el platillo');
        return throwError(() => error);
      })
    );
  }
}