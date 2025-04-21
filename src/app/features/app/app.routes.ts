import { Routes } from '@angular/router';

// Importamos el componente del layout
// Nota: Este componente aún no existe, se creará más adelante
import { AppLayoutComponent } from '../../layout/app-layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      // Explorar y feed social
      {
        path: 'explore',
        loadComponent: () => import('./pages/explore/explore.component').then(c => c.ExploreComponent),
        title: 'Explorar | MenuUPP'
      },
      
      // Pasaporte gastronómico
      {
        path: 'passport',
        loadComponent: () => import('./pages/passport/passport.component').then(c => c.PassportComponent),
        title: 'Pasaporte Gastronómico | MenuUPP'
      },
      
      // Rutas gastronómicas
      {
        path: 'routes',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/routes/routes.component').then(c => c.RoutesComponent),
            title: 'Rutas Gastronómicas | MenuUPP'
          },
          {
            path: ':routeId',
            loadComponent: () => import('./pages/routes/route-detail/route-detail.component').then(c => c.RouteDetailComponent),
            title: 'Detalle de Ruta | MenuUPP'
          }
        ]
      },
      
      // Búsqueda
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search.component').then(c => c.SearchComponent),
        title: 'Buscar | MenuUPP'
      },
      
      // Notificaciones
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications.component').then(c => c.NotificationsComponent),
        title: 'Notificaciones | MenuUPP'
      },
      
      // Mi perfil
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/profile/user-profile/user-profile.component').then(c => c.UserProfileComponent),
            title: 'Mi Perfil | MenuUPP'
          },
          {
            path: 'edit',
            loadComponent: () => import('./pages/profile/edit-profile/edit-profile.component').then(c => c.EditProfileComponent),
            title: 'Editar Perfil | MenuUPP'
          },
          {
            path: 'settings',
            loadComponent: () => import('./pages/profile/user-settings/user-settings.component').then(c => c.UserSettingsComponent),
            title: 'Configuración | MenuUPP'
          },
          {
            path: 'my-routes',
            loadComponent: () => import('./pages/profile/my-routes/my-routes.component').then(c => c.MyRoutesComponent),
            title: 'Mis Rutas | MenuUPP'
          }
        ]
      },
      
      // Redirección predeterminada
      {
        path: '',
        redirectTo: 'explore',
        pathMatch: 'full'
      }
    ]
  }
];