import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { LoginService } from '@services/login.service';

export const authGuard: CanActivateFn = (route, state) => {

  const api = inject(LoginService); // Servicio para autenticación
  const router = inject(Router);   // Servicio para redirección

  // Validar si el token es válido
  return api.validarToken().pipe(
    map(isAuth => {
      if (isAuth && state.url === '/login') {
        // Si el usuario está autenticado y en '/', redirigir a '/compras'
        return router.createUrlTree(['/']);
      }
      // Si no está autenticado, redirigir al login ('/')
      return isAuth || router.createUrlTree(['/login']);
    }),
    tap(isAuth => {
      // Mensajes secundarios para depuración
      if (!isAuth) {
        console.log('Access denied - Redirecting to login');
      } else if (state.url === '/login') {
        console.log('Authenticated user on "/" - Redirecting to /compras');
      }
    })
  );
};
