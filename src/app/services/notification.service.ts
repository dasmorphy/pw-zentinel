import { Injectable, inject } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messaging = inject(Messaging);

  private notifications$ = new BehaviorSubject<any[]>([]);
  notifications = this.notifications$.asObservable();

  async requestPermissionAndListen() {
    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKeyFcm // Firebase Console → Cloud Messaging → Web Push certificates
      });
      // Guarda el token para asociarlo al usuario en tu backend
      console.log('FCM token:', token);
    } catch (err) {
      console.error('Error obteniendo token FCM', err);
    }

    onMessage(this.messaging, (payload) => {
      console.log('Notificación recibida:', payload);
      this.add(payload);
    });
  }

  add(payload: any) {
    const current = this.notifications$.value;
    this.notifications$.next([payload, ...current]);
  }
}