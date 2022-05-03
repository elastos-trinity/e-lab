import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '@core/toast/toast.service';
import { AuthService } from "@pages/auth/services/auth.service";
import { from, Observable, throwError } from "rxjs";
import { catchError } from 'rxjs/operators';
import { ROUTER_UTILS } from '../utils/router.utils';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private authService: AuthService, private toastService: ToastService) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      catchError((error: HttpErrorResponse) => {
        if ([401].includes(error.status)) {
          console.error("Authorization refused", error)
          from(this.handle401Error())
        } else if (error.status === 403) {
          console.log("Server 403 error", error)
          this.toastService.error("Server error: " + error.error)
          return throwError(() => error)
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
