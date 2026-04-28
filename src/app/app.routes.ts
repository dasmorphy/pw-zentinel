import { Routes } from '@angular/router';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { LogbookEntryComponent } from './pages/forms/logbook-entry/logbook-entry.component';
import { LogbookOutComponent } from './pages/forms/logbook-out/logbook-out.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NoAuthGuard } from './guards/noAuth.guard';
import { AuthGuard } from './guards/auth.guard';
import { AllLogbookComponent } from './pages/tables/all-logbooks/all-logbooks.component';
import { NewDispatchForm } from './pages/forms/biomar/new-dispatch-form/new-dispatch-form.component';
import { AllDispatchsComponent } from './pages/tables/all-dispatchs/all-dispatchs.component';
import { AllEntryAccessComponent } from './pages/tables/all-entry-access/all-entry-access.component';
import { NewEntryFormComponent } from './pages/forms/biomar/new-entry-form/new-entry-form.component';
import { FormExpoComponent } from './components/form_expo/form-expo.component';

export const routes: Routes = [
    {
        path: "formulario-expo",
        component: FormExpoComponent,
    },
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
                path: "tablero-bitacoras",
                loadComponent: () => AllLogbookComponent,
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
            },
            {
                path: "crear-despacho",
                loadComponent: () => NewDispatchForm,
                canActivate: [AuthGuard]
            },
            {
                path: "tablero-despacho",
                loadComponent: () => AllDispatchsComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "tablero-ingresos",
                loadComponent: () => AllEntryAccessComponent,
                canActivate: [AuthGuard]
            },
            {
                path: "nuevo-ingreso",
                loadComponent: () => NewEntryFormComponent,
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
