import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { SocialUser, ImageData } from '../../../../../core/models/user.model';

/**
 * Componente para editar el perfil del usuario
 * 
 * Permite al usuario modificar su información personal, como nombre, username,
 * biografía, ubicación e imagen de perfil.
 */
@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    InputComponent
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  // Servicios
  private mockDataService = inject(MockDataService);
  private router = inject(Router);
  
  // Datos del usuario
  originalUser = signal<SocialUser | undefined>(undefined);
  editedUser = signal<{
    name: string;
    lastName: string;
    username: string;
    bio: string;
    location: string;
    profileImage: ImageData | null;
  }>({
    name: '',
    lastName: '',
    username: '',
    bio: '',
    location: '',
    profileImage: null
  });
  
  // Estados
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  error = signal<string | null>(null);
  profileImagePreview = signal<string | null>(null);
  
  // En una app real, obtendríamos este ID del servicio de autenticación
  userId = 'user1';
  
  ngOnInit(): void {
    this.loadUserData();
  }
  
  /**
   * Carga los datos del usuario
   */
  loadUserData(): void {
    this.isLoading.set(true);
    
    this.mockDataService.getUserById(this.userId).subscribe({
      next: (user) => {
        if (user) {
          this.originalUser.set(user);
          this.editedUser.set({
            name: user.name || '',
            lastName: user.lastName || '',
            username: user.username || '',
            bio: user.bio || '',
            location: user.location || '',
            profileImage: user.profileImage || null
          });
          
          if (user.profileImage?.url) {
            this.profileImagePreview.set(user.profileImage.url);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading user data', err);
        this.error.set('Error al cargar los datos del usuario');
        this.isLoading.set(false);
      }
    });
  }
  
  /**
   * Maneja el cambio de la imagen de perfil
   */
  onProfileImageChange(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      this.error.set('El archivo seleccionado no es una imagen válida.');
      return;
    }
    
    // Previsualizar la imagen
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImagePreview.set(reader.result as string);
      
      // Actualizar el objeto de usuario editado
      const currentUser = this.editedUser();
      this.editedUser.set({
        ...currentUser,
        profileImage: {
          url: reader.result as string,
          alt: `${currentUser.name} ${currentUser.lastName}`
        }
      });
    };
    reader.readAsDataURL(file);
  }
  
  /**
   * Guarda los cambios del perfil
   */
  saveProfile(): void {
    this.isSaving.set(true);
    this.error.set(null);
    
    // Validar campos
    const user = this.editedUser();
    if (!user.name.trim()) {
      this.error.set('El nombre es obligatorio');
      this.isSaving.set(false);
      return;
    }
    
    if (!user.username.trim()) {
      this.error.set('El nombre de usuario es obligatorio');
      this.isSaving.set(false);
      return;
    }
    
    // Simular guardado con un timeout
    setTimeout(() => {
      // En una app real, esto sería una llamada a la API
      console.log('Perfil guardado:', user);
      this.isSaving.set(false);
      
      // Navegar de vuelta al perfil
      this.router.navigate(['/app/profile']);
    }, 1500);
  }
  
  /**
   * Cancela la edición y vuelve al perfil
   */
  cancelEdit(): void {
    this.router.navigate(['/app/profile']);
  }
  
  /**
   * Elimina la imagen de perfil
   */
  removeProfileImage(): void {
    this.profileImagePreview.set(null);
    
    const currentUser = this.editedUser();
    this.editedUser.set({
      ...currentUser,
      profileImage: null
    });
  }
  
  /**
   * Actualiza un campo del usuario
   */
  updateUserField(field: string, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = target.value;
    
    const currentUser = this.editedUser();
    this.editedUser.set({
      ...currentUser,
      [field]: value
    });
  }
}