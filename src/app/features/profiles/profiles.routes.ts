//src/app/features/profiles/profiles.routes.ts
import { Routes } from '@angular/router';

// Importamos el componente del layout
// Nota: Este componente aún no existe, se creará más adelante
import { ProfileLayoutComponent } from '../../layout/profile-layout/profile-layout.component';

export const routes: Routes = [
  {
    path: ':username',
    component: ProfileLayoutComponent,
    children: [
      // Ruta base para perfil de restaurante o usuario
      {
        path: '',
        loadComponent: () => {
          // Carga dinámica basada en el tipo de perfil
          // Esto se gestionará en el componente
          return import('./profile-loader/profile-loader.component').then(c => c.ProfileLoaderComponent);
        },
        title: 'Perfil | MenuUPP'
      },
      
      // Sección de menú para restaurantes
      {
        path: 'menu',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/restaurant-menu/restaurant-menu.component').then(c => c.RestaurantMenuComponent),
            title: 'Menú | MenuUPP'
          },
          {
            path: 'category/:categoryId',
            loadComponent: () => import('./pages/restaurant-menu/restaurant-menu.component').then(c => c.RestaurantMenuComponent),
            title: 'Categoría | Menú | MenuUPP'
          }
        ]
      },
      
      // Detalle de platillo en restaurante
      {
        path: 'dish/:dishId',
        loadComponent: () => import('./pages/dish-detail/dish-detail.component').then(c => c.DishDetailComponent),
        title: 'Detalle de Platillo | MenuUPP'
      },
      
      // Enlaces personalizados de restaurante
      {
        path: 'links',
        loadComponent: () => import('./pages/restaurant-links/restaurant-links.component').then(c => c.RestaurantLinksComponent),
        title: 'Enlaces | MenuUPP'
      },
      
      // Información de restaurante
      {
        path: 'info',
        loadComponent: () => import('./pages/restaurant-info/restaurant-info.component').then(c => c.RestaurantInfoComponent),
        title: 'Información | MenuUPP'
      },
      
      // Reseñas de restaurante
      {
        path: 'reviews',
        loadComponent: () => import('./pages/restaurant-reviews/restaurant-reviews.component').then(c => c.RestaurantReviewsComponent),
        title: 'Reseñas | MenuUPP'
      },
      
      // Rutas para perfiles de usuarios normales
      {
        path: 'routes',
        loadComponent: () => import('./pages/user-public-routes/user-public-routes.component').then(c => c.UserPublicRoutesComponent),
        title: 'Rutas | MenuUPP'
      },
      
      // Favoritos de usuarios
      {
        path: 'favorites',
        loadComponent: () => import('./pages/user-favorites/user-favorites.component').then(c => c.UserFavoritesComponent),
        title: 'Favoritos | MenuUPP'
      }
    ]
  }
];