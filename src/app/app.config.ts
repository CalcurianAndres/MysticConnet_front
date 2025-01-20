import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { serverRoutes } from './app.routes.server';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRoutesConfig } from '@angular/ssr';

// Registrar la localización de España
registerLocaleData(localeEs);

// Configuración de la aplicación
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    // provideServerRendering(),
    // provideServerRoutesConfig(serverRoutes),

    // Configurar la localización para toda la aplicación
    { provide: LOCALE_ID, useValue: 'es' }
  ]
};
