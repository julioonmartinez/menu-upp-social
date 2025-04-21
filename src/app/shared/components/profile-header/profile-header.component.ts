import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { ImageData } from '../../../core/models/user.model';

/**
 * Componente para mostrar el encabezado de un perfil
 * 
 * Funciona tanto para perfiles de restaurantes como de usuarios,
 * mostrando su información principal y acciones.
 */
@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss']
})
export class ProfileHeaderComponent {
  /**
   * Tipo de perfil: restaurante o usuario
   */
  @Input() profileType: 'restaurant' | 'user' = 'restaurant';
  
  /**
   * Nombre del perfil
   */
  @Input() name = '';
  
  /**
   * Nombre de usuario (para la URL)
   */
  @Input() username = '';
  
  /**
   * Descripción del perfil
   */
  @Input() description = '';
  
  /**
   * Imagen de perfil/logo
   */
  @Input() profileImage: ImageData | null = null;
  
  /**
   * Imagen de portada
   */
  @Input() coverImage: ImageData | null = null;
  
  /**
   * Número de seguidores
   */
  @Input() followers = 0;
  
  /**
   * Si el usuario actual sigue a este perfil
   */
  @Input() isFollowing = false;
  
  /**
   * Si es un restaurante, su valoración media
   */
  @Input() rating: number | null = null;
  
  /**
   * Si es un restaurante, número de valoraciones
   */
  @Input() ratingCount = 0;
  
  /**
   * Si es un usuario, número de usuarios que sigue
   */
  @Input() following = 0;
  
  /**
   * Estado de carga para acciones
   */
  @Input() loading = false;
  
  /**
   * Evento emitido al hacer clic en "Seguir"
   */
  @Output() followClicked = new EventEmitter<void>();
  
  /**
   * Evento emitido al hacer clic en "Compartir"
   */
  @Output() shareClicked = new EventEmitter<void>();
  
  /**
   * Maneja clic en "Seguir"
   */
  onFollowClick(): void {
    this.followClicked.emit();
  }
  
  /**
   * Maneja clic en "Compartir"
   */
  onShareClick(): void {
    this.shareClicked.emit();
  }
}