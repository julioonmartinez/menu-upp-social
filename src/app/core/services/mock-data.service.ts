import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, map, tap, catchError, switchMap } from 'rxjs';

import { SocialUser } from '../models/user.model';
import { Restaurant } from '../models/restaurant.model';
import { Dish, Category } from '../models/dish.model';
import { GastronomicRoute, SocialActivity, RouteReview } from '../models/route.model';
import { Badge } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  constructor(private http: HttpClient) {}
  
  // Usuarios
  getUsers(): Observable<SocialUser[]> {
    return this.http.get<SocialUser[]>('/assets/mocks/users.json').pipe(
      delay(800) // Simular latencia
    );
  }
  
  getUserById(userId: string): Observable<SocialUser | undefined> {
    return this.http.get<SocialUser[]>('/assets/mocks/users.json').pipe(
      map(users => users.find(user => user.id === userId)),
      delay(800)
    );
  }
  
  getUserByUsername(username: string): Observable<SocialUser | undefined> {
    return this.http.get<SocialUser[]>('/assets/mocks/users.json').pipe(
      tap(users => console.log('Usuarios cargados:', users.length)),
      map(users => {
        const user = users.find(u => u.username === username);
        console.log('Usuario encontrado por username:', user);
        return user;
      }),
      delay(800)
    );
  }
  
  // Restaurantes
  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>('/assets/mocks/restaurants.json').pipe(
      delay(800)
    );
  }
  
  getRestaurantById(restaurantId: string): Observable<Restaurant | undefined> {
    return this.http.get<Restaurant[]>('/assets/mocks/restaurants.json').pipe(
      map(restaurants => restaurants.find(restaurant => restaurant.id === restaurantId)),
      delay(800)
    );
  }
  
  getRestaurantByUsername(username: string): Observable<Restaurant | undefined> {
    console.log('Buscando restaurante con username:', username);
    
    return this.http.get<Restaurant[]>('/assets/mocks/restaurants.json').pipe(
      tap(data => console.log('Restaurantes cargados:', data.length)),
      map(restaurants => {
        const restaurant = restaurants.find(r => r.username === username);
        console.log('Restaurante encontrado por username:', restaurant);
        return restaurant;
      }),
      catchError(err => {
        console.error('Error al cargar datos de restaurantes:', err);
        return of(undefined);
      }),
      delay(800)
    );
  }
  
  // Platillos
  getDishes(): Observable<Dish[]> {
    return this.http.get<Dish[]>('/assets/mocks/dishes.json').pipe(
      delay(800)
    );
  }
  
  getDishesByRestaurant(restaurantId: string): Observable<Dish[]> {
    console.log('Buscando platos para restaurante:', restaurantId);
    
    // Primero necesitamos obtener el restaurante para tener su username
    return this.getRestaurantById(restaurantId).pipe(
      switchMap(restaurant => {
        if (!restaurant) {
          console.error(`Restaurante no encontrado con ID: ${restaurantId}`);
          return of([]);
        }
        
        // Ahora obtenemos los platos y les agregamos el username
        return this.http.get<Dish[]>('/assets/mocks/dishes.json').pipe(
          tap(data => console.log('Platos cargados:', data.length)),
          map(dishes => {
            const filtered = dishes
              .filter(dish => dish.restaurantId === restaurantId)
              .map(dish => ({
                ...dish,
                restaurantUsername: restaurant.username // Añadimos el username
              }));
            
            console.log(`Platos filtrados para restaurante ${restaurantId}:`, filtered.length);
            return filtered;
          }),
          catchError(err => {
            console.error('Error al cargar datos de platos:', err);
            return of([]);
          }),
          delay(800)
        );
      })
    );
  }
  
  getDishById(dishId: string): Observable<Dish | undefined> {
    return this.http.get<Dish[]>('/assets/mocks/dishes.json').pipe(
      switchMap(dishes => {
        const dish = dishes.find(d => d.id === dishId);
        
        if (!dish) {
          return of(undefined);
        }
        
        // Obtener el restaurante para añadir el username
        return this.getRestaurantById(dish.restaurantId).pipe(
          map(restaurant => {
            if (restaurant) {
              return {
                ...dish,
                restaurantUsername: restaurant.username
              };
            }
            return dish;
          })
        );
      }),
      delay(800)
    );
  }
  
  // Categorías
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('/assets/mocks/categories.json').pipe(
      tap(data => console.log('Categorías cargadas:', data.length)),
      catchError(err => {
        console.error('Error al cargar categorías:', err);
        return of([]);
      }),
      delay(800)
    );
  }
  
  getCategoriesByRestaurant(restaurantId: string): Observable<Category[]> {
    console.log('Buscando categorías para restaurante:', restaurantId);
    
    return this.http.get<Category[]>('/assets/mocks/categories.json').pipe(
      tap(data => console.log('Categorías cargadas:', data.length)),
      map(categories => {
        const filtered = categories.filter(category => category.restaurantId === restaurantId);
        console.log(`Categorías filtradas para restaurante ${restaurantId}:`, filtered.length);
        return filtered;
      }),
      catchError(err => {
        console.error('Error al cargar categorías del restaurante:', err);
        return of([]);
      }),
      delay(800)
    );
  }
  
  // Rutas gastronómicas
  getRoutes(): Observable<GastronomicRoute[]> {
    return this.http.get<GastronomicRoute[]>('/assets/mocks/routes.json').pipe(
      delay(800)
    );
  }
  
  getRouteById(routeId: string): Observable<GastronomicRoute | undefined> {
    return this.http.get<GastronomicRoute[]>('/assets/mocks/routes.json').pipe(
      map(routes => routes.find(route => route.id === routeId)),
      delay(800)
    );
  }
  
  getRoutesByUser(userId: string): Observable<GastronomicRoute[]> {
    return this.http.get<GastronomicRoute[]>('/assets/mocks/routes.json').pipe(
      map(routes => routes.filter(route => route.creatorId === userId)),
      delay(800)
    );
  }
  
  getRoutesByCity(city: string): Observable<GastronomicRoute[]> {
    return this.http.get<GastronomicRoute[]>('/assets/mocks/routes.json').pipe(
      map(routes => routes.filter(route => route.city?.toLowerCase() === city.toLowerCase())),
      delay(800)
    );
  }
  
  getRouteTags(): Observable<string[]> {
    return this.http.get<GastronomicRoute[]>('/assets/mocks/routes.json').pipe(
      map(routes => {
        const tagsSet = new Set<string>();
        routes.forEach(route => {
          route.tags?.forEach(tag => tagsSet.add(tag));
        });
        return Array.from(tagsSet);
      }),
      delay(800)
    );
  }
  
  getRouteReviews(routeId: string): Observable<RouteReview[]> {
    return this.http.get<RouteReview[]>('/assets/mocks/route-reviews.json').pipe(
      map(reviews => reviews.filter(review => review.routeId === routeId)),
      delay(800)
    );
  }
  
  getCompletedRoutesByUser(userId: string): Observable<GastronomicRoute[]> {
    // En un caso real, esto vendría directamente del endpoint
    // Aquí simulamos buscando rutas que tengan estado de completado
    return this.http.get<GastronomicRoute[]>('/assets/mocks/routes.json').pipe(
      map(routes => routes.filter(route => 
        route.completionStatus?.isStarted && 
        route.completionStatus?.completedDate !== undefined
      )),
      delay(800)
    );
  }
  
  getInProgressRoutesByUser(userId: string): Observable<GastronomicRoute[]> {
    // Simulamos buscando rutas iniciadas pero no completadas
    return this.http.get<GastronomicRoute[]>('/assets/mocks/routes.json').pipe(
      map(routes => routes.filter(route => 
        route.completionStatus?.isStarted && 
        route.completionStatus?.completedDate === undefined
      )),
      delay(800)
    );
  }
  
  // Actividades
  getActivities(): Observable<SocialActivity[]> {
    return this.http.get<SocialActivity[]>('/assets/mocks/activities.json').pipe(
      delay(800)
    );
  }
  
  getActivitiesByUser(userId: string): Observable<SocialActivity[]> {
    return this.http.get<SocialActivity[]>('/assets/mocks/activities.json').pipe(
      map(activities => activities.filter(activity => activity.userId === userId)),
      delay(800)
    );
  }
  
  getRouteActivities(routeId: string): Observable<SocialActivity[]> {
    return this.http.get<SocialActivity[]>('/assets/mocks/activities.json').pipe(
      map(activities => activities.filter(activity => 
        activity.targetId === routeId && 
        ['route_completed', 'route_started', 'route_progress'].includes(activity.type)
      )),
      delay(800)
    );
  }
  
  // Insignias
  getBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>('/assets/mocks/badges.json').pipe(
      delay(800)
    );
  }
  
  getBadgesByUser(userId: string): Observable<Badge[]> {
    return this.http.get<SocialUser[]>('/assets/mocks/users.json').pipe(
      map(users => {
        const user = users.find(u => u.id === userId);
        return user?.passport?.badges || [];
      }),
      delay(800)
    );
  }
  
  // Búsquedas
  searchDishes(query: string): Observable<Dish[]> {
    return this.http.get<Dish[]>('/assets/mocks/dishes.json').pipe(
      map(dishes => dishes.filter(dish => 
        dish.name.toLowerCase().includes(query.toLowerCase()) ||
        dish.description?.toLowerCase().includes(query.toLowerCase())
      )),
      delay(1200) // Búsquedas un poco más lentas
    );
  }
  
  searchRestaurants(query: string): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>('/assets/mocks/restaurants.json').pipe(
      map(restaurants => restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
        restaurant.description?.toLowerCase().includes(query.toLowerCase())
      )),
      delay(1200)
    );
  }
  
  searchRoutes(query: string): Observable<GastronomicRoute[]> {
    return this.http.get<GastronomicRoute[]>('/assets/mocks/routes.json').pipe(
      map(routes => routes.filter(route => 
        route.name.toLowerCase().includes(query.toLowerCase()) ||
        route.description?.toLowerCase().includes(query.toLowerCase())
      )),
      delay(1200)
    );
  }
}