import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

/**
 * Recover Password Component
 * 
 * Componente para recuperar la contraseña
 */
@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonComponent, CardComponent],
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent {
  // Estados
  loading = false;
  error: string | null = null;
  success = false;
  
  // Formulario
  recoverForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.recoverForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.recoverForm.controls).forEach(key => {
        const control = this.recoverForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.loading = true;
    this.error = null;
    this.success = false;
    
    // Simular una petición de recuperación
    setTimeout(() => {
      // Simulación de éxito (en una implementación real, esto sería una llamada al servicio de autenticación)
      console.log('Recuperación solicitada para', this.recoverForm.value.email);
      this.loading = false;
      this.success = true;
    }, 1500);
  }
  
  /**
   * Verifica si un campo tiene errores
   */
  hasError(controlName: string): boolean {
    const control = this.recoverForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(controlName: string): string {
    const control = this.recoverForm.get(controlName);
    
    if (!control) {
      return '';
    }
    
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (control.hasError('email')) {
      return 'Introduce un email válido';
    }
    
    return '';
  }
}