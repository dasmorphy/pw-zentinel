import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, effect, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment.development';
import { UtilsService } from './utils.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private utilsService = inject(UtilsService);
    private userService = inject(UserService);
    private readonly router = inject(Router)
    
    signIn(user: string, pass: string) {
        if (user == 'admin' && pass == '123456') {
            const dataUser = {
                'email': user,
                'name': 'Administrador',
                'user': user,
                'role': 'admin',
                'business': 'Expalsa',
                'id_business': 1,
                'group_business': 1,
                'name_group_business': 'Camanglar 1',
            };
            localStorage.setItem('sb_token', JSON.stringify(dataUser));
            this.userService.setUserStorage(dataUser)
            this.router.navigate(['/dashboard']);

        } else if (user == 'camanglar1@hotmail.com' && pass == '123456') {
            const dataUser = {
                'email': user,
                'name': 'Daniel Males',
                'user': user,
                'group_business': 1,
                'name_group_business': 'Camanglar 1',
                'role': 'guardia',
            };
            localStorage.setItem('sb_token', JSON.stringify(dataUser));
            this.userService.setUserStorage(dataUser)
            this.router.navigate(['/dashboard']);

        } else if (user == 'camanglar2@hotmail.com' && pass == '123456') {
            const dataUser = {
                'email': user,
                'user': user,
                'name': 'David Cedeño',
                'group_business': 2,
                'name_group_business': 'Camanglar 2',
                'role': 'guardia',
            };
            localStorage.setItem('sb_token', JSON.stringify(dataUser));
            this.userService.setUserStorage(dataUser)
            this.router.navigate(['/dashboard']);

        } else if (user == 'camanglar3@hotmail.com' && pass == '123456') {
            const dataUser = {
                'email': user,
                'user': user,
                'name': 'David Villamar',
                'group_business': 3,
                'name_group_business': 'Camanglar 3',
                'role': 'guardia',
            };

            localStorage.setItem('sb_token', JSON.stringify(dataUser));
            this.userService.setUserStorage(dataUser)
            this.router.navigate(['/dashboard']);
        } else {
            this.utilsService.onError('Usuario o contraseña incorrectos');
        }
    }

    logout() {
        localStorage.removeItem('sb_token');
        this.router.navigate(['/login']);
    }
}