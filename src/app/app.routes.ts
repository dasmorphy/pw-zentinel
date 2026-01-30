import { Routes } from '@angular/router';
import { SigninComponent } from './pages/auth/signin/signin.component';

export const routes: Routes = [

    {
        path: "",
        component: SigninComponent,
        // canActivate: [NoAuthGuard]
    },



];
