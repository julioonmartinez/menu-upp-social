import { Injectable, inject, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, map, catchError, finalize } from 'rxjs/operators';

import { MockDataService } from './mock-data.service';
import { 
  GastronomicRoute, 
  RouteStop, 
  RouteCompletionStatus,
  RouteReview
} from '../models/route.model';

/**
 * Servicio para gestionar las rutas gastronómicas
 * 
 * Utiliza signals para manejar el estado y proporciona métodos para
 * cargar, filtrar y manipular rutas.
 */
@Injectable({
  providedIn: 'root'
})
export class RoutesService {
  private mockDataService = inject(MockDataService);
  
  // Signals para el estado
  private _routes = signal<GastronomicRoute[]>([]);
  private _currentRoute = signal<GastronomicRoute | null>(null);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);
  private _filterTag = signal<string | null>(null);
  private _filterDifficulty = signal<string | null>(null);
  
  // Exposición de signals como readonly
  public routes = this._routes.asReadonly();
  public currentRoute = this._currentRoute.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();
  
  // Señales computadas
  public filteredRoutes = computed(() => {
    let result = this._routes();
    const filterTag = this._filterTag();
    const filterDifficulty = this._filterDifficulty();
    
    if (filterTag) {
      result = result.filter(route => 
        route.tags?.includes(filterTag)
      );
    }
    
    if (filterDifficulty) {
      result = result.filter(route => 
        route.difficulty === filterDifficulty
      );
    }
    
    return result;
  });
  
  public popularRoutes = computed(() => {
    const routes = this._routes();
    return [...routes]
      .sort((a, b) => (b.completed || 0) - (a.completed || 0))
      .slice(0, 5);
  });
  
  public newRoutes = computed(() => {
    const routes = this._routes();
    return [...routes]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  });
  
  /**
   * Carga todas las rutas disponibles
   */
  loadRoutes(): void {
    this._loading.set(true);
    this._error.set(null);
    
    this.mockDataService.getRoutes().pipe(
      tap(routes => this._routes.set(routes)),
      catchError(err => {
        this._error.set('Error al cargar las rutas');
        console.error('Error loading routes', err);
        return of([]);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }
  
  /**
   * Carga una ruta específica por su ID
   */
  loadRouteById(routeId: string): void {
    this._loading.set(true);
    this._error.set(null);
    
    this.mockDataService.getRouteById(routeId).pipe(
      tap(route => {
        if (route) {
          this._currentRoute.set(route);
        } else {
          this._error.set('Ruta no encontrada');
        }
      }),
      catchError(err => {
        this._error.set('Error al cargar la ruta');
        console.error(`Error loading route ${routeId}`, err);
        return of(null);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }
  
  /**
   * Carga las rutas creadas por un usuario específico
   */
  loadRoutesByUser(userId: string): void {
    this._loading.set(true);
    this._error.set(null);
    
    this.mockDataService.getRoutesByUser(userId).pipe(
      tap(routes => this._routes.set(routes)),
      catchError(err => {
        this._error.set('Error al cargar las rutas del usuario');
        console.error(`Error loading routes for user ${userId}`, err);
        return of([]);
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }
  
  /**
   * Aplica un filtro por etiqueta
   */
  setTagFilter(tag: string | null): void {
    this._filterTag.set(tag);
  }
  
  /**
   * Aplica un filtro por dificultad
   */
  setDifficultyFilter(difficulty: string | null): void {
    this._filterDifficulty.set(difficulty);
  }
  
  /**
   * Inicia una ruta para el usuario actual
   * (En una implementación real, esto haría una llamada a la API)
   */
  startRoute(routeId: string): Observable<boolean> {
    const route = this._routes().find(r => r.id === routeId);
    
    if (!route) {
      return of(false);
    }
    
    // En una implementación real, esto sería una llamada a la API
    const status: RouteCompletionStatus = {
      isStarted: true,
      completedStops: 0,
      totalStops: route.stops.length,
      progress: 0,
      startedDate: new Date()
    };
    
    const updatedRoute = {
      ...route,
      completionStatus: status
    };
    
    // Actualiza la ruta en el estado
    this._updateRoute(updatedRoute);
    
    // Mock de una llamada a API exitosa
    return of(true).pipe(delay(800));
  }
  
  /**
   * Marca una parada de ruta como completada
   * (En una implementación real, esto haría una llamada a la API)
   */
  completeRouteStop(routeId: string, stopId: string): Observable<boolean> {
    const route = this._routes().find(r => r.id === routeId);
    
    if (!route || !route.completionStatus) {
      return of(false);
    }
    
    // Encuentra y actualiza la parada
    const updatedStops = route.stops.map(stop => {
      if (stop.id === stopId) {
        return {
          ...stop,
          isCompleted: true,
          completedDate: new Date()
        };
      }
      return stop;
    });
    
    // Calcula el nuevo progreso
    const completedStops = updatedStops.filter(stop => stop.isCompleted).length;
    const progress = Math.round((completedStops / updatedStops.length) * 100);
    
    // Actualiza el estado de completado
    let completionStatus: RouteCompletionStatus = {
      ...route.completionStatus,
      completedStops,
      progress,
      lastVisitDate: new Date()
    };
    
    // Si todas las paradas están completadas, marca la ruta como completada
    if (completedStops === updatedStops.length) {
      completionStatus = {
        ...completionStatus,
        completedDate: new Date()
      };
    }
    
    const updatedRoute = {
      ...route,
      stops: updatedStops,
      completionStatus
    };
    
    // Actualiza la ruta en el estado
    this._updateRoute(updatedRoute);
    
    // Mock de una llamada a API exitosa
    return of(true).pipe(delay(800));
  }
  
  /**
   * Actualiza una ruta en el estado
   */
  private _updateRoute(updatedRoute: GastronomicRoute): void {
    const routes = this._routes();
    const index = routes.findIndex(r => r.id === updatedRoute.id);
    
    if (index !== -1) {
      const newRoutes = [...routes];
      newRoutes[index] = updatedRoute;
      this._routes.set(newRoutes);
      
      // Si es la ruta actual, actualiza también currentRoute
      if (this._currentRoute()?.id === updatedRoute.id) {
        this._currentRoute.set(updatedRoute);
      }
    }
  }
}

// Función de utilidad para simular delay
function delay(ms: number) {
  return function<T>(observable: Observable<T>): Observable<T> {
    return new Observable<T>(observer => {
      const subscription = observable.subscribe({
        next(value) {
          setTimeout(() => observer.next(value), ms);
        },
        error(err) {
          setTimeout(() => observer.error(err), ms);
        },
        complete() {
          setTimeout(() => observer.complete(), ms);
        }
      });
      
      return () => subscription.unsubscribe();
    });
  };
}