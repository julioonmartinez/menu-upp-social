import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

/**
 * Register Component
 * 
 * Componente para registrarse en la plataforma
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonComponent, CardComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  // Estados
  loading = false;
  error: string | null = null;
  
  // Tipos de cuenta
  accountTypes = [
    { value: 'USER', label: 'Foodie', icon: 'fa-user', description: 'Descubre restaurantes y rutas' },
    { value: 'RESTAURANT', label: 'Restaurante', icon: 'fa-utensils', description: 'Promociona tu negocio' }
  ];
  
  // Formulario
  registerForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      accountType: ['USER', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  
  /**
   * Validador personalizado para comprobar que las contraseñas coinciden
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      form.get('confirmPassword')?.setErrors(
        form.get('confirmPassword')?.hasError('required') ? { required: true } : null
      );
      return null;
    }
  }
  
  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    // Simular una petición de registro
    setTimeout(() => {
      // Simulación de éxito (en una implementación real, esto sería una llamada al servicio de autenticación)
      console.log('Registro exitoso', this.registerForm.value);
      this.loading = false;
      
      // Redirección en una implementación real
      // this.router.navigate(['/app/explore']);
    }, 1500);
  }
  
  /**
   * Verifica si un campo tiene errores
   */
  hasError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  
  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    
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
    
    if (control.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    
    if (control.hasError('requiredTrue')) {
      return 'Debes aceptar los términos y condiciones';
    }
    
    return '';
  }
  
  /**
   * Selecciona un tipo de cuenta
   */
  selectAccountType(type: string): void {
    this.registerForm.patchValue({ accountType: type });
  }
}