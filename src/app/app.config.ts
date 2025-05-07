import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions,  } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { TokenService } from './core/services/token.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, 
      withComponentInputBinding(),
      withViewTransitions()
    
    ),
    provideClientHydration(withEventReplay()),
    { provide: TokenService, useClass: TokenService },
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
    provideAnimations()
   
  ]
};
