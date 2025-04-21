import { Component, Input, Optional, Self } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Componente Input
 * 
 * Componente personalizado para inputs que funciona con Reactive Forms
 * y proporciona estilos y validación consistentes.
 * 
 * @example
 * <app-input 
 *   label="Email" 
 *   [formControl]="emailControl"
 *   placeholder="ejemplo@correo.com" 
 *   icon="envelope"
 *   [required]="true"
 * ></app-input>
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements ControlValueAccessor {
  /**
   * Etiqueta del input
   */
  @Input() label = '';
  
  /**
   * Placeholder del input
   */
  @Input() placeholder = '';
  
  /**
   * Tipo de input (text, password, email, etc.)
   */
  @Input() type = 'text';
  
  /**
   * Icono de Font Awesome (sin el prefijo fa-)
   */
  @Input() icon?: string;
  
  /**
   * Si el campo es requerido
   */
  @Input() required = false;
  
  /**
   * ID único para el campo
   */
  @Input() id = `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Propiedades para implementar ControlValueAccessor
  value: any = '';
  isDisabled = false;
  onChange = (_: any) => {};
  onTouched = () => {};
  
  constructor(@Self() @Optional() public control: NgControl) {
    if (this.control) {
      this.control.valueAccessor = this;
    }
  }
  
  /**
   * Escribe el valor en el input (desde el formControl)
   */
  writeValue(value: any): void {
    this.value = value;
  }
  
  /**
   * Registra la función que se llamará cuando el valor cambie
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  /**
   * Registra la función que se llamará cuando el input pierda el foco
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  /**
   * Deshabilita el input
   */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
  
  /**
   * Maneja el evento input
   */
  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }
  
  /**
   * Maneja el evento blur
   */
  onBlur(): void {
    this.onTouched();
  }
  
  /**
   * Verifica si el campo tiene errores
   */
  get hasError(): boolean {
    return !!(
      this.control && 
      this.control.invalid && 
      (this.control.dirty || this.control.touched)
    );
  }
  
  /**
   * Obtiene el mensaje de error
   */
  get errorMessage(): string {
    if (!this.hasError || !this.control) {
      return '';
    }
    
    const errors = this.control.errors;
    if (!errors) {
      return '';
    }
    
    if (errors['required']) {
      return 'Este campo es obligatorio';
    }
    
    if (errors['email']) {
      return 'Introduce un email válido';
    }
    
    if (errors['minlength']) {
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    }
    
    if (errors['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }
    
    // Si hay otros errores pero no está gestionado, devolvemos un mensaje genérico
    return 'Este campo tiene un error';
  }
}