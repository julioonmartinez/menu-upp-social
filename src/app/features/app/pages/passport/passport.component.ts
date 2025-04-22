import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../../../core/services/mock-data.service';
import { Badge } from '../../../../core/models/user.model';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

/**
 * Componente para el Pasaporte Gastronómico
 * 
 * Muestra los logros, insignias, nivel y estadísticas del usuario
 * en un formato visual tipo pasaporte.
 */
@Component({
  selector: 'app-passport',
  standalone: true,
  imports: [CommonModule, RouterModule, CardComponent, ButtonComponent],
  templateUrl: './passport.component.html',
  styleUrls: ['./passport.component.scss']
})
export class PassportComponent implements OnInit {
  // Servicios
  private mockDataService = inject(MockDataService);
  
  // Datos
  badges: Badge[] = [];
  categories: string[] = [];
  activeCategory: string = 'all';
  
  // Estados
  isLoading = true;
  error: string | null = null;
  
  // Datos del usuario (en una app real, obtendríamos esto del servicio de autenticación)
  userId = 'user1';
  userLevel = 4;
  userExperience = 1250;
  nextLevelExperience = 2000;
  experienceProgress = 0;
  visits = 18;
  reviews = 12;
  routes = 3;
  
  ngOnInit(): void {
    this.loadBadges();
  }
  
  /**
   * Carga las insignias del usuario
   */
  loadBadges(): void {
    this.isLoading = true;
    
    this.mockDataService.getBadgesByUser(this.userId).subscribe({
      next: (badges) => {
        this.badges = badges;
        // Extraer categorías únicas de las insignias
        this.extractCategories();
        this.calculateExperienceProgress();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading user badges', err);
        this.error = 'Error al cargar las insignias del pasaporte';
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Extrae categorías únicas de las insignias
   */
  private extractCategories(): void {
    const categoriesSet = new Set<string>();
    
    this.badges.forEach(badge => {
      if (badge.category) {
        categoriesSet.add(badge.category);
      }
    });
    
    this.categories = Array.from(categoriesSet);
  }
  
  /**
   * Calcula el porcentaje de progreso hacia el siguiente nivel
   */
  private calculateExperienceProgress(): void {
    const currentExp = this.userExperience;
    const nextLevelExp = this.nextLevelExperience;
    const prevLevelExp = nextLevelExp - 1000; // Asumimos que cada nivel requiere 1000 XP más
    
    const earned = currentExp - prevLevelExp;
    const required = nextLevelExp - prevLevelExp;
    
    this.experienceProgress = Math.floor((earned / required) * 100);
  }
  
  /**
   * Filtra las insignias por categoría
   */
  filterByCategory(category: string): void {
    this.activeCategory = category;
  }
  
  /**
   * Obtiene las insignias filtradas
   */
  get filteredBadges(): Badge[] {
    if (this.activeCategory === 'all') {
      return this.badges;
    }
    
    return this.badges.filter(badge => badge.category === this.activeCategory);
  }
  
  /**
   * Comprueba si el usuario tiene una insignia desbloqueada
   */
  isBadgeUnlocked(badge: Badge): boolean {
    return !!badge.dateEarned;
  }
  
  /**
   * Formatea la fecha en formato legible
   */
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    
    const badgeDate = new Date(date);
    return badgeDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}