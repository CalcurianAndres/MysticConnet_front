import { Routes } from '@angular/router';
import { authGuard } from '@auth/auth.guard';
import { RenderMode, ServerRoute } from '@angular/ssr';

export const routes: Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component'),
        canActivate: [authGuard], // Protege esta ruta
        children: [
            {
                path: 'administracion',
                title: 'Administración',
                loadComponent: () => import('./dashboard/pages/administracion/administracion.component')
            },
            {
                path: 'perfil',
                title: 'Perfil',
                loadComponent: () => import('./dashboard/pages/perfil/perfil.component')
            },
            {
                path: 'promotora/:id',
                title: 'Promotora',
                loadComponent: () => import('./dashboard/pages/promotoras/promotoras.component')
            },
            {
                path: 'cliente/:id',
                title: 'Cliente',
                loadComponent: () => import('./dashboard/pages/clientes/clientes.component')
            },
            {
                path: 'detalle/:id',
                title: 'Detalle',
                loadComponent: () => import('./dashboard/pages/detalle/detalle.component')
            },
            {
                path: 'reportes',
                title: 'Reportes',
                loadComponent: () => import('./dashboard/pages/reporte/reporte.component')
            },
            {
                path: 'estadisticas',
                title: 'Estadísticas',
                loadComponent: () => import('./dashboard/pages/estadisticas/estadisticas.component'),
            },
            {
                path: 'region/:id',
                title: 'Región',
                loadComponent: () => import('./dashboard/pages/region/region.component'),
            },
            {
                path: 'charts',
                title: 'Estadísticas',
                loadComponent: () => import('./dashboard/pages/estadisticas/reportes-generales/reportes-generales.component')
            },
            {
                path: 'planificacion',
                title: 'Planificación',
                loadComponent: () => import('./dashboard/pages/estadisticas/planificacion/planificacion.component')
            },
            {
                path: '',
                redirectTo: 'reportes',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'login',
        title: 'Mystic Connect',
        loadComponent: () => import('./login/login.component')
    },
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    }
];
