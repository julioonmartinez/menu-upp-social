//src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Sección pública (landing, login, registro)
  {
    path: '',
    loadChildren: () => import('./features/public/public.routes').then(m => m.routes)
  },
  
  // Sección del usuario autenticado (explore, passport, etc)
  {
    path: 'app',
    loadChildren: () => import('./features/app/app.routes').then(m => m.routes),
    // canActivate: [authGuard] // Proteger cuando se implemente auth
  },
  
  // Perfiles públicos de restaurantes y usuarios
  {
    path: 'profile',
    loadChildren: () => import('./features/profiles/profiles.routes').then(m => m.routes)
  },
  
  // Redireccionamiento para rutas no encontradas
  {
    path: '**', 
    redirectTo: ''
  }
  
];