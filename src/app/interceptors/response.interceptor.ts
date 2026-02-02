import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, Observable, throwError } from 'rxjs';


export const httpInterceptorResponse: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const router = inject(Router)
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('time_expiration');
        localStorage.removeItem('time_session');

        if (!req.url.includes('/rest/cw-auth-api/v1.0/login') && 
        !req.url.includes('/rest/cw-user-manager-api/v1.0/dfa_code')) {
          messageService.clear();
          messageService.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Sesión finalizada'
          })
        }
        router.navigate(['/']);
      } 

      return throwError(() => error);
    
    })
  );
}