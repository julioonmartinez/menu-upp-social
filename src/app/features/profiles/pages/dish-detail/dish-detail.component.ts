import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ProfileService } from '../../../../core/services/profile.service';
import { MenuService } from '../../../../core/services/menu.service';
import { ReviewService } from '../../../../core/services/review.service';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { ReviewCardComponent } from '../../../../shared/components/review-card/review-card.component';

/**
 * Componente para mostrar el detalle de un platillo
 * 
 * Muestra información completa del plato, ingredientes, alergenos, 
 * valoraciones y reseñas.
 */
@Component({
  selector: 'app-dish-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    ReviewCardComponent
  ],
  templateUrl: './dish-detail.component.html',
  styleUrls: ['./dish-detail.component.scss']
})
export class DishDetailComponent implements OnInit, OnDestroy {
  // Servicios
  private profileService = inject(ProfileService);
  private menuService = inject(MenuService);
  private reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);
  
  // Para limpiar suscripciones
  private destroy$ = new Subject<void>();
  
  // Estados
  showAllIngredients = false;
  showAddReview = false;
  ratingValue = 5;
  reviewComment = '';
  loadingAddReview = false;
  activeImageIndex = 0;
  
  // Filtros de reseñas
  activeSortOption: 'recent' | 'rating-high' | 'rating-low' = 'recent';
  activeRatingFilter: number | null = null;
  
  ngOnInit(): void {
    // Obtener username del restaurante
    this.route.parent?.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const username = params['username'];
      if (username) {
        this.profileService.loadProfileByUsername(username);
      }
    });
    
    // Obtener ID del platillo
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const dishId = params['dishId'];
      if (dishId) {
        this.menuService.loadDishById(dishId);
        this.reviewService.loadDishReviews(dishId);
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Muestra/oculta todos los ingredientes
   */
  toggleIngredients(): void {
    this.showAllIngredients = !this.showAllIngredients;
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
    if (!this.dish || !this.reviewComment.trim()) return;
    
    this.loadingAddReview = true;
    
    this.reviewService.addReview(
      this.dish.id!, 
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
   * Marca/desmarca el plato como favorito
   */
  toggleFavorite(): void {
    if (!this.dish) return;
    this.menuService.toggleFavorite(this.dish.id!);
  }
  
  /**
   * Cambia la imagen activa en la galería
   */
  setActiveImage(index: number): void {
    this.activeImageIndex = index;
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
  
  get dish() {
    return this.menuService.selectedDish();
  }
  
  get restaurant() {
    return this.profileService.currentRestaurant();
  }
  
  get restaurantUsername() {
    return this.profileService.currentProfileUsername();
  }
  
  get activeImage() {
    if (!this.dish?.images || this.dish.images.length === 0) {
      return this.dish?.mainImage;
    }
    
    if (this.activeImageIndex >= this.dish.images.length) {
      return this.dish.images[0];
    }
    
    return this.dish.images[this.activeImageIndex];
  }
  
  get allImages() {
    if (!this.dish) return [];
    
    const images = [...(this.dish.images || [])];
    if (this.dish.mainImage && !images.some(img => img.url === this.dish?.mainImage?.url)) {
      images.unshift(this.dish.mainImage);
    }
    
    return images;
  }
  
  get visibleIngredients() {
    if (!this.dish?.ingredients) return [];
    
    if (this.showAllIngredients) {
      return this.dish.ingredients;
    }
    
    return this.dish.ingredients.slice(0, 6);
  }
  
  get hasMoreIngredients() {
    return this.dish?.ingredients && this.dish.ingredients.length > 6;
  }
  
  get reviews() {
    return this.reviewService.sortedAndFilteredReviews();
  }
  
  get reviewStats() {
    return this.reviewService.reviewStats();
  }
  
  get loading() {
    return this.profileService.loading() || this.menuService.loadingDish();
  }
  
  get loadingReviews() {
    return this.reviewService.loading();
  }
  
  get error() {
    return this.profileService.error() || this.menuService.error();
  }
  
  get isFavorite(): boolean {
    return (this.dish?.favorites || 0) > 10; // Simplificación para demo
  }
}