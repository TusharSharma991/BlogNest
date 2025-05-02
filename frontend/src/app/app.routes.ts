import { Routes } from '@angular/router';
import { MainNavComponent } from './internal/main-nav/main-nav.component';

export const routes: Routes = [


    {
        path: '',
        redirectTo: '/signUp',
        pathMatch: 'full'
    },

    {
        path: 'login',
        loadComponent: () => import('../app/external/login/login.component').then(m => m.LoginComponent)
    },

    {
        path: 'signUp',
        loadComponent: () => import('../app/external/sign-up/sign-up.component').then(m => m.SignUpComponent)
    },

    // {
    //     path: 'dashboard',
    //     loadComponent: () => import('../app/internal/dashboard/dashboard.component').then(m => m.DashboardComponent)
    // },


    {
        path: 'dashboard', component: MainNavComponent,
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('../app/internal/dashboard/dashboard.component').then(
                m => m.DashboardComponent
              )
          },
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          }
        ]
      },

];
