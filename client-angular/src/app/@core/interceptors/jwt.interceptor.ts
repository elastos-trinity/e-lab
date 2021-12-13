import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { getItem, StorageItem } from "@core/utils";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // todo: refactor this should use the IsLoggedIn
    const isLoggedIn = getItem(StorageItem.AccessToken) !== null;
    const token = getItem(StorageItem.AccessToken);
    const isApiUrl = request.url.startsWith(environment.elabApiUrl);



    if (isLoggedIn && isApiUrl) {
      // todo: maybe change the backend to use the common Auth Bearer header instead of token ?
      const headers = new HttpHeaders({
        'token': `${token}`,
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json'
      });
      request = request.clone({headers});
    }

    return next.handle(request);
  }
}
