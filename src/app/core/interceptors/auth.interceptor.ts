import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ErrorService } from '../../shared/services/error.service';
import { AuthService } from '../../shared/services/auth.service';
import { catchError, throwError, from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const errorService = inject(ErrorService);
  const authService = inject(AuthService);
  
  // Add JWT token to requests
  return from(authService.getToken()).pipe(
    switchMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
          // Skip interceptor for login/signup errors to handle in component
          if (req.url.includes('/auth/login') || req.url.includes('/auth/signup')) {
            return throwError(() => error);
          }

          // Handle 401 Unauthorized (session expired)
          if (error.status === 401) {
            authService.clearUserData();
            errorService.showError('Session expired. Please login again.');
            return throwError(() => new Error('Session expired'));
          }

          // Handle other errors
          let errorMessage = 'An error occurred';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          errorService.showError(errorMessage);
          return throwError(() => new Error(errorMessage));
        })
      );
    })
  );
};