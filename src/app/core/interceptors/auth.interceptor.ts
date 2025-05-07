import { inject } from '@angular/core';
import { 
  HttpRequest, 
  HttpHandlerFn, 
  HttpInterceptorFn, 
  HttpErrorResponse 
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

// Importamos un servicio "TokenService" en lugar de AuthService directamente
// Esta es una estrategia para romper la dependencia circular
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  
  // Obtenemos el token directamente del localStorage si estamos en el navegador
  // En lugar de usar el AuthService
  let token = tokenService.getToken();
  
  if (isBrowser) {
    token = localStorage.getItem('auth_token');
  }
  
  // Añadir token a las solicitudes si está disponible
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isBrowser) {
        // Token inválido o expirado
        localStorage.removeItem('auth_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};