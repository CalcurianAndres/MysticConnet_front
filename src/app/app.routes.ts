import { Routes } from '@angular/router';
import { authGuard } from '@auth/auth.guard';

export const routes: Routes = [
    {
        path:'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component'),
        canActivate: [authGuard], // Protege esta ruta
        children:[
            {
                path:'administracion',
                title:'Administración',
                loadComponent: () => import('./dashboard/pages/administracion/administracion.component')
            },
            // {
            //     path:'perfil/:id',
            //     title:'Perfil',
            //     loadComponent: () => import('./dashboard/pages/perfil/perfil.component')
            // },
            {
                path:'reportes',
                title:'Reportes',
                loadComponent: () => import('./dashboard/pages/reporte/reporte.component')
            },
            {
                path:'estadisticas',
                title:'Estadísticas',
                loadComponent: () => import('./dashboard/pages/estadisticas/estadisticas.component')
            },
            {
                path:'',
                redirectTo:'reportes',
                pathMatch:'full'
            }
        ]
    },
    {
        path:'login',
        title:'Mystic Connect',
        loadComponent: () => import('./login/login.component')
    },
    {
        path:'',
        redirectTo:'/dashboard',
        pathMatch:'full'
    }
];
