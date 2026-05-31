import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppStateService } from './app-state.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private state: AppStateService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const user = this.state.user();
    let cloned = req;

    if (user?.token) {
      cloned = req.clone({ setHeaders: { Authorization: `Bearer ${user.token}` } });
    }

    return next.handle(cloned).pipe(
      catchError((err) => {
        // Basic error handling placeholder: rethrow after logging
        // In a real app we could map to user-friendly messages or redirect on 401
        // eslint-disable-next-line no-console
        console.error('HTTP error', err);
        return throwError(() => err);
      }),
    );
  }
}

export const authInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true,
};
