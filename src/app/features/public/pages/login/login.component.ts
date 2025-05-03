import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

/**
 * Login Component
 * 
 * Componente para iniciar sesión en la plataforma
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonComponent, CardComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  //injecciones
  router = inject(Router);
  // Estados
  loading = false;
  error: string | null = null;
  
  // Formulario
  loginForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }
  
  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    // Simular una petición de inicio de sesión
    setTimeout(() => {
      // Simulación de éxito (en una implementación real, esto sería una llamada al servicio de autenticación)
      console.log('Login exitoso', this.loginForm.value);
      this.loading = false;
      
      // Redirección en una implementación real
      this.router.navigate(['/app/explore']);
    }, 1500);
  }
  
  /**
   * Verifica si un campo tiene errores
   */
  hasError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    
    if (!control) {
      return '';
    }
    
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    
    if (control.hasError('email')) {
      return 'Introduce un email válido';
    }
    
    if (control.hasError('minlength')) {
      return `Mínimo ${control.getError('minlength').requiredLength} caracteres`;
    }
    
    return '';
  }
}