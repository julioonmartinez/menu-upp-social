import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ProfileService } from '../../../../core/services/profile.service';
import { ReviewService } from '../../../../core/services/review.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ReviewCardComponent } from '../../../../shared/components/review-card/review-card.component';
import { DishReview } from '../../../../core/models/dish.model';

/**
 * Componente para mostrar las reseñas de un restaurante
 * 
 * Muestra todas las reseñas del restaurante con opciones de filtrado
 * y ordenación.
 */
@Component({
  selector: 'app-restaurant-reviews',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    ReviewCardComponent
  ],
  templateUrl: './restaurant-reviews.component.html',
  styleUrls: ['./restaurant-reviews.component.scss']
})
export class RestaurantReviewsComponent implements OnInit, OnDestroy {
  // Servicios
  private profileService = inject(ProfileService);
  private reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Estados locales
  showAddReview = false;
  ratingValue = 5;
  reviewComment = '';
  loadingAddReview = false;
  
  // Filtros de reseñas
  activeSortOption: 'recent' | 'rating-high' | 'rating-low' = 'recent';
  activeRatingFilter: number | null = null;
  
  ngOnInit(): void {
    // Obtener el username de la ruta
    this.route.parent?.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const username = params['username'];
      if (username && this.restaurantId) {
        this.profileService.loadProfileByUsername(username);
        
        // Cargar reseñas del restaurante
        this.loadReviews();
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Carga las reseñas del restaurante
   */
  loadReviews(): void {
    // En una implementación real, esto cargaría las reseñas del restaurante
    // Por ahora, usamos las reseñas del dish1 como ejemplo
    this.reviewService.loadDishReviews('dish1');
  }
  
  /**
   * Muestra/oculta formulario para añadir reseña
   */
  toggleAddReview(): void {
    this.showAddReview = !this.showAddReview;
  }
  
  /**
   * Envía una nueva reseña
   */
  submitReview(): void {
    if (!this.reviewComment.trim()) return;
    
    this.loadingAddReview = true;
    
    this.reviewService.addReview(
      'dish1', // En una implementación real, esto sería el restaurantId
      this.ratingValue, 
      this.reviewComment
    ).subscribe({
      next: (success) => {
        if (success) {
          this.showAddReview = false;
          this.reviewComment = '';
          this.ratingValue = 5;
        }
        this.loadingAddReview = false;
      },
      error: () => {
        this.loadingAddReview = false;
      }
    });
  }
  
  /**
   * Establece el orden de las reseñas
   */
  setSortOption(option: 'recent' | 'rating-high' | 'rating-low'): void {
    this.activeSortOption = option;
    this.reviewService.setSortBy(option);
  }
  
  /**
   * Establece el filtro de valoración
   */
  setRatingFilter(rating: number | null): void {
    this.activeRatingFilter = rating;
    this.reviewService.setRatingFilter(rating);
  }
  
  /**
   * Maneja "me gusta" en una reseña
   */
  onReviewLike(reviewId: string): void {
    this.reviewService.toggleLike(reviewId);
  }
  
  /**
   * Maneja "responder" a una reseña
   */
  onReviewReply(reviewId: string): void {
    // En una app real, esto mostraría un diálogo para responder
    console.log('Responder a la reseña:', reviewId);
  }
  
  // Getters
  
  get restaurant() {
    return this.profileService.currentRestaurant();
  }
  
  get restaurantId(): string {
    return this.restaurant?.id || '';
  }
  
  get restaurantName(): string {
    return this.profileService.currentProfileName();
  }
  
  get restaurantUsername(): string {
    return this.profileService.currentProfileUsername();
  }
  
  get restaurantImage() {
    return this.profileService.currentProfileImage();
  }
  
  get reviews(): DishReview[] {
    return this.reviewService.sortedAndFilteredReviews();
  }
  
  get reviewStats() {
    return this.reviewService.reviewStats();
  }
  
  get loading(): boolean {
    return this.profileService.loading();
  }
  
  get loadingReviews(): boolean {
    return this.reviewService.loading();
  }
  
  get error(): string | null {
    return this.profileService.error();
  }
  
  get isRestaurant(): boolean {
    return this.profileService.profileType() === 'restaurant';
  }
}