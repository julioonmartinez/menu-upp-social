import { Routes } from '@angular/router';

// Importamos el componente del layout
import { PublicLayoutComponent } from '../../layout/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      // Página de inicio (landing)
      {
        path: '',
        loadComponent: () => import('./pages/landing/landing.component').then(c => c.LandingComponent),
        title: 'MenuUPP - Plataforma Social Gastronómica'
      },
      
      // Inicio de sesión
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent),
        title: 'Iniciar Sesión | MenuUPP'
      },
      
      // Registro
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(c => c.RegisterComponent),
        title: 'Registro | MenuUPP'
      },
      
      // Recuperación de contraseña
      {
        path: 'recover-password',
        loadComponent: () => import('./pages/recover-password/recover-password.component').then(c => c.RecoverPasswordComponent),
        title: 'Recuperar Contraseña | MenuUPP'
      },
      
      // Términos y condiciones
      {
        path: 'terms',
        loadComponent: () => import('./pages/terms/terms.component').then(c => c.TermsComponent),
        title: 'Términos y Condiciones | MenuUPP'
      },
      
      // Política de privacidad
      {
        path: 'privacy',
        loadComponent: () => import('./pages/privacy/privacy.component').then(c => c.PrivacyComponent),
        title: 'Política de Privacidad | MenuUPP'
      }
    ]
  }
];