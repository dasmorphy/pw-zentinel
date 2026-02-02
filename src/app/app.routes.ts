import { Routes } from '@angular/router';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { LogbookEntryComponent } from './pages/forms/logbook-entry/logbook-entry.component';
import { LogbookOutComponent } from './pages/forms/logbook-out/logbook-out.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NoAuthGuard } from './guards/noAuth.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [

    {
        path: "login",
        component: SigninComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: "",
        component: LayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },
            {
                path: "dashboard",
                loadComponent: () => DashboardComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "reporte-entrada",
                loadComponent: () => LogbookEntryComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "reporte-salida",
                loadComponent: () => LogbookOutComponent,
                canActivate: [AuthGuard]
            }
        ],
        canActivate: [AuthGuard]
    },

    {
        path: "**",
        redirectTo: "dashboard",
    },

];
