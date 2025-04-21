import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';

import { MockDataService } from './mock-data.service';
import { DishReview } from '../models/dish.model';
import { SocialUser } from '../models/user.model';

/**
 * Servicio para gestionar reseñas de platos y restaurantes
 */
@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private mockDataService = inject(MockDataService);
  
  // Signals
  private _reviews = signal<DishReview[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _sortBy = signal<'recent' | 'rating-high' | 'rating-low'>('recent');
  private _filterRating = signal<number | null>(null);
  
  // Exposición de signals como readonly
  public reviews = this._reviews.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();
  public sortBy = this._sortBy.asReadonly();
  public filterRating = this._filterRating.asReadonly();
  
  // Mock del usuario actual (en una app real, sería del servicio de autenticación)
  private currentUser: SocialUser = {
    id: 'user1',
    email: 'maria.lopez@example.com',
    name: 'María',
    lastName: 'López',
    role: 'USER',
    username: 'maria_foodie',
    profileImage: {
      url: 'assets/images/users/profile1.jpg',
      alt: 'María López'
    }
  };
  
  // Señales computadas
  public sortedAndFilteredReviews = computed(() => {
    let result = [...this._reviews()];
    const sort = this._sortBy();
    const ratingFilter = this._filterRating();
    
    // Filtrar por calificación
    if (ratingFilter !== null) {
      result = result.filter(review => review.rating === ratingFilter);
    }
    
    // Ordenar
    if (sort === 'recent') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sort === 'rating-high') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'rating-low') {
      result.sort((a, b) => a.rating - b.rating);
    }
    
    return result;
  });
  
  public reviewStats = computed(() => {
    const reviews = this._reviews();
    const total = reviews.length;
    
    if (total === 0) {
      return {
        average: 0,
        total: 0,
        distribution: [0, 0, 0, 0, 0]
      };
    }
    
    // Calcular promedio
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;
    
    // Calcular distribución
    const distribution = [0, 0, 0, 0, 0]; // Para ratings 1-5
    reviews.forEach(review => {
      const index = Math.floor(review.rating) - 1;
      if (index >= 0 && index < 5) {
        distribution[index]++;
      }
    });
    
    return {
      average,
      total,
      distribution
    };
  });
  
  /**
   * Carga las reseñas de un plato
   */
  loadDishReviews(dishId: string): void {
    this._loading.set(true);
    this._error.set(null);
    
    // En una app real, esto sería un endpoint específico
    // Para el mock, filtramos del array general de platos
    this.mockDataService.getDishById(dishId).pipe(
      map(dish => dish?.reviews || []),
      finalize(() => this._loading.set(false))
    ).subscribe({
      next: (reviews) => this._reviews.set(reviews),
      error: (err) => {
        console.error('Error loading dish reviews', err);
        this._error.set('Error al cargar las reseñas');
      }
    });
  }
  
  /**
   * Establece el criterio de ordenación
   */
  setSortBy(sortBy: 'recent' | 'rating-high' | 'rating-low'): void {
    this._sortBy.set(sortBy);
  }
  
  /**
   * Establece el filtro de calificación
   */
  setRatingFilter(rating: number | null): void {
    this._filterRating.set(rating);
  }
  
  /**
   * Añade una reseña a un plato
   * En una app real, esto haría una llamada a la API
   */
  addReview(dishId: string, rating: number, comment: string): Observable<boolean> {
    // Crear nueva reseña
    const newReview: DishReview = {
      id: `rev-${Date.now()}`,
      userId: this.currentUser.id!,
      userName: `${this.currentUser.name} ${this.currentUser.lastName || ''}`,
      userImage: this.currentUser.profileImage,
      rating,
      comment,
      createdAt: new Date(),
      likes: 0
    };
    
    // Actualizar estado local optimistamente
    const currentReviews = this._reviews();
    this._reviews.set([newReview, ...currentReviews]);
    
    // En una app real, aquí haríamos la llamada a la API
    // Simulamos éxito después de un delay
    return of(true).pipe(
      delay(800),
      catchError(err => {
        // En caso de error, revertimos
        this._reviews.set(currentReviews);
        this._error.set('Error al añadir la reseña');
        console.error('Error adding review', err);
        return of(false);
      })
    );
  }
  
  /**
   * Marca/desmarca una reseña como "me gusta"
   * En una app real, esto haría una llamada a la API
   */
  toggleLike(reviewId: string): void {
    const currentReviews = this._reviews();
    
    const updatedReviews = currentReviews.map(review => {
      if (review.id === reviewId) {
        // Simular toggle - en una app real verificaríamos si ya dio like
        const hasLiked = Math.random() > 0.5; // Simulación
        const updatedLikes = (review.likes || 0) + (hasLiked ? -1 : 1);
        return {
          ...review,
          likes: updatedLikes >= 0 ? updatedLikes : 0
        };
      }
      return review;
    });
    
    this._reviews.set(updatedReviews);
  }
}

// Función de utilidad para simular delay
function delay(ms: number) {
  return function<T>(observable: Observable<T>): Observable<T> {
    return new Observable<T>(observer => {
      const subscription = observable.subscribe({
        next(value) {
          setTimeout(() => observer.next(value), ms);
        },
        error(err) {
          setTimeout(() => observer.error(err), ms);
        },
        complete() {
          setTimeout(() => observer.complete(), ms);
        }
      });
      
      return () => subscription.unsubscribe();
    });
  };
}