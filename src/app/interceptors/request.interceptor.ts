import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Observable } from 'rxjs';
import { v4 as uuidv4} from 'uuid';


export const httpInterceptorRequest: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  if (req.url.includes('/rest/token-api/v1.0/generate')) return next(req)
  let token = "";
  let idGroup = ""
  const user_session = localStorage.getItem('user');
  let  urlPath: any;

  if (req.url != '/assets/encryption_key/public_key_prod.pem') {
    urlPath = new URL(req.url)?.pathname
  }

  if (user_session){
    // const user_session_json: any = JSON.parse(decrypt(user_session));
    // token = user_session_json.access_token
    // idGroup = user_session_json?.groups[0]?.id
  }
  const clone:any = req.clone();

  if (req.method === 'GET') {
    clone.headers = clone.headers
      .set('Authorization', `Bearer ${token}`)
      .set('channel', 'ZENTINEL_WEB')
      .set('externalTransactionId', uuidv4());

  }else {
    req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          Group: idGroup
        },
        body: {
          ...req.body as object,
          channel: "ZENTINEL_WEB",
          externalTransactionId: uuidv4()
        }
      })
  }

  return next(clone)
}