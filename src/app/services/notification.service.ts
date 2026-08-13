import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { NotificationCache, NotificationItem } from '../models/notification';
import { UserService } from './user.service';
import { UtilsService } from './utils.service';

const STORAGE_KEY_NOTIFICATIONS = 'notifications_zentinel';
/** Tiempo que se considera vigente la caché local antes de volver a consultar (10 min) */
const CACHE_TTL_MS = 10 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messaging = inject(Messaging);
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly utilsService = inject(UtilsService);

  notifications: WritableSignal<NotificationItem[]> = signal<NotificationItem[]>([]);
  isLoading: WritableSignal<boolean> = signal<boolean>(false);

  user_session: any;
  unreadCount = computed(() => this.notifications().filter((item) => !item.is_read).length);

  /** Etiqueta del badge de la campana. Cadena vacía = no se pinta el badge */
  badgeLabel = computed(() => {
    const count = this.unreadCount();

    if (count === 0) {
      return '';
    }

    return count > 99 ? '99+' : `${count}`;
  });

  private cacheSavedAt: number = 0;

  constructor() {
    const cache = this.readCache();

    if (cache) {
      this.notifications.set(cache.items);
      this.cacheSavedAt = cache.saved_at;
    }
  }

  /**
   * Punto de entrada para el header y el listado completo.
   * Solo consulta al backend si no hay caché local vigente (o si se fuerza la recarga).
   */
  loadNotifications(force: boolean = false) {
    if (!force && this.isCacheValid()) {
      return;
    }

    this.fetchNotifications();
  }

  private fetchNotifications() {
    if (this.isLoading()) {
      return;
    }

    this.user_session = this.userService.getDataSession();

    this.isLoading.set(true);

    this.getNotifications({"user_id": this.user_session?.id_user}).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data: NotificationItem[] = response?.data ?? response ?? [];
        this.setNotifications(data);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.log(error);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Peticiones HTTP (implementación pendiente)
  // ---------------------------------------------------------------------------

  /**
   * Debe responder un arreglo de NotificationItem (directo o dentro de { data: [] }).
   */
  getNotifications(filter?: any): Observable<any> {
    let params = new HttpParams();
    let headers = new HttpHeaders();

    if (filter?.user_id) {
      params = params.set('id_user', filter.user_id);
    }

    return this.http.get(`${environment.apiUrl}/rest/notifications-api/v1.0/notifications`, { headers, params });
  }


  saveFcmToken(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/rest/notifications-api/v1.0/fcm-token-user`, {data});
  }

  /** TODO: reemplazar por el endpoint real para marcar una notificación como leída */
  markAsReadRequest(id_notification: string): Observable<any> {
    // return this.http.patch(`${environment.apiUrl}/rest/zent-notification-api/v1.0/notifications/${id_notification}/read`, {});
    return of(null);
  }

  /** TODO: reemplazar por el endpoint real para marcar todas las notificaciones como leídas */
  markAllAsReadRequest(): Observable<any> {
    // return this.http.patch(`${environment.apiUrl}/rest/zent-notification-api/v1.0/notifications/read-all`, {});
    return of(null);
  }

  /** TODO: reemplazar por el endpoint real para eliminar una notificación */
  deleteNotificationRequest(id_notification: string): Observable<any> {
    // return this.http.delete(`${environment.apiUrl}/rest/zent-notification-api/v1.0/notifications/${id_notification}`);
    return of(null);
  }

  // ---------------------------------------------------------------------------
  // Estado local
  // ---------------------------------------------------------------------------

  setNotifications(items: NotificationItem[]) {
    const clean = (items ?? [])
      .filter((item) => item && !item.is_deleted)
      .sort((a, b) => this.parseDate(b.sent_at ?? b.created_at).getTime() - this.parseDate(a.sent_at ?? a.created_at).getTime());

    this.notifications.set(clean);
    this.writeCache(clean);
  }

  /** Agrega una notificación nueva (push de FCM o event source) al inicio del listado */
  add(notification: any) {
    const mapped = this.mapPushPayload(notification);

    if (!mapped) {
      return;
    }

    const exists = this.notifications().some((item) => item.id_notification === mapped.id_notification);

    if (exists) {
      return;
    }

    this.setNotifications([mapped, ...this.notifications()]);
  }

  markAsRead(notification: NotificationItem) {
    if (!notification || notification.is_read) {
      return;
    }

    this.updateNotification(notification.id_notification, {
      is_read: true,
      read_at: new Date().toISOString()
    });

    this.markAsReadRequest(notification.id_notification).subscribe({
      error: (error: any) => console.log(error)
    });
  }

  markAllAsRead() {
    if (this.unreadCount() === 0) {
      return;
    }

    const read_at = new Date().toISOString();
    this.setNotifications(
      this.notifications().map((item) => (item.is_read ? item : { ...item, is_read: true, read_at }))
    );

    this.markAllAsReadRequest().subscribe({
      error: (error: any) => console.log(error)
    });
  }

  deleteNotification(notification: NotificationItem) {
    this.setNotifications(
      this.notifications().filter((item) => item.id_notification !== notification.id_notification)
    );

    this.deleteNotificationRequest(notification.id_notification).subscribe({
      error: (error: any) => console.log(error)
    });
  }

  private updateNotification(id_notification: string, changes: Partial<NotificationItem>) {
    this.setNotifications(
      this.notifications().map((item) =>
        item.id_notification === id_notification ? { ...item, ...changes } : item
      )
    );
  }

  // ---------------------------------------------------------------------------
  // Caché local
  // ---------------------------------------------------------------------------

  private isCacheValid(): boolean {
    return this.cacheSavedAt > 0 && Date.now() - this.cacheSavedAt < CACHE_TTL_MS;
  }

  private readCache(): NotificationCache | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);

      if (!raw) {
        return null;
      }

      const cache: NotificationCache = JSON.parse(raw);

      if (!Array.isArray(cache?.items)) {
        return null;
      }

      return cache;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  private writeCache(items: NotificationItem[]) {
    try {
      this.cacheSavedAt = Date.now();
      const cache: NotificationCache = { items, saved_at: this.cacheSavedAt };
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(cache));
    } catch (error) {
      console.log(error);
    }
  }

  /** Limpia el estado y la caché (usar al cerrar sesión) */
  clearCache() {
    this.cacheSavedAt = 0;
    this.notifications.set([]);
    localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
  }

  // ---------------------------------------------------------------------------
  // Helpers de presentación
  // ---------------------------------------------------------------------------

  /** Las fechas del backend llegan sin zona horaria, se interpretan como UTC */
  parseDate(value: string | Date | null | undefined): Date {
    if (!value) {
      return new Date();
    }

    if (value instanceof Date) {
      return value;
    }

    return new Date(value);
  }

  timeAgo(value: string | Date | null | undefined): string {
    const date = this.parseDate(value);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) {
      return 'Hace un momento';
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `Hace ${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `Hace ${hours} h`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 5) {
      return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    }

    const years = Math.floor(days / 365);
    return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
  }

  getIconNotification(notification_type: string): string {
    const type = (notification_type ?? '').toUpperCase();

    if (type.includes('REJECTED')) {
      return 'pi pi-times-circle';
    }

    if (type.includes('APPROVED')) {
      return 'pi pi-check-circle';
    }

    if (type.includes('REQUEST')) {
      return 'pi pi-send';
    }

    if (type.includes('TECHNICAL')) {
      return 'pi pi-wrench';
    }

    if (type.includes('DISPATCH')) {
      return 'pi pi-truck';
    }

    if (type.includes('PURCHASE') || type.includes('ORDER')) {
      return 'pi pi-file';
    }

    return 'pi pi-bell';
  }

  getSeverityNotification(notification_type: string): 'success' | 'info' | 'warning' | 'danger' {
    const type = (notification_type ?? '').toUpperCase();

    if (type.includes('REJECTED') || type.includes('ERROR')) {
      return 'danger';
    }

    if (type.includes('APPROVED') || type.includes('COMPLETED')) {
      return 'success';
    }

    if (type.includes('PENDING') || type.includes('REQUEST')) {
      return 'warning';
    }

    return 'info';
  }

  // ---------------------------------------------------------------------------
  // Firebase Cloud Messaging
  // ---------------------------------------------------------------------------

  async requestPermissionAndListen() {
    console.log('🔥 Inicializando FCM');
    console.log('Permiso:', Notification.permission);

    try {
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKeyFcm
      });

      console.log('🔥 TOKEN ACTUAL:', token);

      this.user_session = this.userService.getDataSession();

      console.log('Usuario:', this.user_session?.id_user);

      const data = {
        fcm_token: token,
        platform: 'web',
        project_id: 1,
        user_id: this.user_session?.id_user
      };

      this.saveFcmToken(data).subscribe({
        next: (response) => {
          console.log('✅ TOKEN GUARDADO:', response);
        },
        error: (error) => {
          console.error('❌ ERROR GUARDANDO TOKEN:', error);
        }
      });

    } catch (err) {
      console.error('❌ ERROR OBTENIENDO TOKEN FCM:', err);
    }

    console.log('🔥 Registrando onMessage');

    onMessage(this.messaging, (payload) => {
      console.log('🔥🔥🔥 FCM RECIBIDO:', payload);

      const title = payload.notification?.title;

      this.utilsService.onSuccess(
        title ?? 'N/A',
        4000,
        'Notificación recibida'
      );

      this.add(payload);
    });
  }

  /** Normaliza el payload de FCM al modelo del listado */
  private mapPushPayload(payload: any): NotificationItem | null {
    if (!payload) {
      return null;
    }

    // Si ya viene con la estructura del backend se usa tal cual
    if (payload.id_notification) {
      return payload as NotificationItem;
    }

    const data = payload.data ?? {};
    const notification = payload.notification ?? {};
    const now = new Date().toISOString();
    const notification_type = data.notification_type ?? 'GENERAL';

    return {
      body: notification.body ?? data.body ?? '',
      created_at: now,
      data,
      id_notification: data.id_notification ?? payload.messageId ?? `${Date.now()}`,
      img_url: notification.image ?? data.img_url ?? null,
      is_deleted: false,
      is_read: false,
      notification_type,
      read_at: null,
      sent_at: now,
      status: 'sent',
      title: notification.title ?? data.title ?? 'Notificación',
      updated_at: now,
      user_id: data.user_id ?? ''
    };
  }
}
