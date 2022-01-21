import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable, throwError } from "rxjs";
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      catchError((error: HttpErrorResponse) => {
        if ([401, 403].includes(error.status)) {
          console.error("Authorization refused", error)
          from(this.handle401Error())
        } else {
          console.error("Server error", error)
          return throwError(() => error)
        }
      }),
    );
  }

  private async handle401Error() {
    await this.authService.signOut()
    return this.router.navigate([ROUTER_UTILS.config.auth.root, ROUTER_UTILS.config.auth.signIn])
  }
}
