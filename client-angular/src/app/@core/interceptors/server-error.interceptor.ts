import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ROUTER_UTILS } from '../utils/router.utils';
import { AuthService } from "@pages/auth/services/auth.service";

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log("ERROR catched")
        if ([401, 403].includes(error.status)) {
          this.authService.signOut()
          this.router.navigate([ROUTER_UTILS.config.auth.root, ROUTER_UTILS.config.auth.signIn])
          return throwError(error)
        } else if (error.status === 500) {
          console.error(error)
          return throwError(error)
        } else {
          return throwError(error);
        }
      }),
    );
  }
}
