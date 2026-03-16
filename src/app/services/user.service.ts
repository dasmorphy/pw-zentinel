import { Injectable, WritableSignal, effect, inject, signal } from '@angular/core';
import { jwtDecode } from "jwt-decode";
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private router = inject(Router);

    user_storage: WritableSignal<any> = signal({})

    
    setUserStorage(json_user: any) {
        this.user_storage.set(json_user);
    }

    getDataSession() {
        const token = localStorage.getItem('sb_token');
        if (token) {
            try {
                return jwtDecode(token);
            } catch (error) {
                localStorage.removeItem('sb_token');
                this.router.navigate(['/login']);
            }
        }
        return {};
    }
}