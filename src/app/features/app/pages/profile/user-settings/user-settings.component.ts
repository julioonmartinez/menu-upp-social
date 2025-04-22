import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../../shared/components/card/card.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { SocialUser } from '../../../../../core/models/user.model';

/**
 * Componente para la configuración del usuario
 * 
 * Permite configurar preferencias de notificaciones, privacidad, y otras opciones.
 */
@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    InputComponent
  ],
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
  // Servicios
  private mockDataService = inject(MockDataService);
  
  // Usuario
  user = signal<SocialUser | undefined>(undefined);
  
  // Estado
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  isDeleting = signal<boolean>(false);
  showDeleteConfirm = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  
  // Configuraciones
  notificationSettings = signal<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    activityDigest: boolean;
    newFollowers: boolean;
    mentions: boolean;
    system: boolean;
  }>({
    emailNotifications: true,
    pushNotifications: true,
    activityDigest: true,
    newFollowers: true,
    mentions: true,
    system: true
  });
  
  privacySettings = signal<{
    publicProfile: boolean;
    showActivity: boolean;
    showFollowers: boolean;
    showVisitedPlaces: boolean;
    allowTagging: boolean;
  }>({
    publicProfile: true,
    showActivity: true,
    showFollowers: true,
    showVisitedPlaces: true,
    allowTagging: true
  });
  
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
        this.user.set(user);
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
   * Método auxiliar para manejar cambios en los checkboxes de notificaciones
   */
  onCheckboxChange(event: Event, setting: string): void {
    const checkbox = event.target as HTMLInputElement;
    this.updateNotificationSetting(setting, checkbox.checked);
  }
  
  /**
   * Método auxiliar para manejar cambios en los checkboxes de privacidad
   */
  onPrivacyCheckboxChange(event: Event, setting: string): void {
    const checkbox = event.target as HTMLInputElement;
    this.updatePrivacySetting(setting, checkbox.checked);
  }
  
  /**
   * Guarda las configuraciones de notificaciones
   */
  saveNotificationSettings(): void {
    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);
    
    // Simular guardado con un timeout
    setTimeout(() => {
      this.isSaving.set(false);
      this.success.set('Configuración de notificaciones guardada correctamente');
      
      // Limpiar mensaje de éxito después de un tiempo
      setTimeout(() => {
        this.success.set(null);
      }, 5000);
    }, 1000);
  }
  
  /**
   * Guarda las configuraciones de privacidad
   */
  savePrivacySettings(): void {
    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);
    
    // Simular guardado con un timeout
    setTimeout(() => {
      this.isSaving.set(false);
      this.success.set('Configuración de privacidad guardada correctamente');
      
      // Limpiar mensaje de éxito después de un tiempo
      setTimeout(() => {
        this.success.set(null);
      }, 5000);
    }, 1000);
  }
  
  /**
   * Actualiza el valor de una configuración de notificaciones
   */
  updateNotificationSetting(setting: string, value: boolean): void {
    const currentSettings = this.notificationSettings();
    this.notificationSettings.set({ ...currentSettings, [setting]: value });
  }
  
  /**
   * Actualiza el valor de una configuración de privacidad
   */
  updatePrivacySetting(setting: string, value: boolean): void {
    const currentSettings = this.privacySettings();
    this.privacySettings.set({ ...currentSettings, [setting]: value });
  }
  
  /**
   * Muestra u oculta la confirmación para eliminar cuenta
   */
  toggleDeleteConfirm(): void {
    this.showDeleteConfirm.set(!this.showDeleteConfirm());
  }
  
  /**
   * Simula la eliminación de la cuenta
   */
  deleteAccount(): void {
    this.isDeleting.set(true);
    
    // Simular eliminación con un timeout
    setTimeout(() => {
      this.isDeleting.set(false);
      // En una app real, redirigiríamos a la página de inicio de sesión
      console.log('Cuenta eliminada');
    }, 2000);
  }
  
  /**
   * Cierra la sesión (simulado)
   */
  logout(): void {
    // En una app real, llamaríamos al servicio de autenticación
    console.log('Cerrando sesión...');
  }
}