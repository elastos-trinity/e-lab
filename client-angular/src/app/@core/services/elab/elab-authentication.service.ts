import { environment } from "@env/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { VerifiablePresentation } from "@elastosfoundation/did-js-sdk";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import ElabBackendAuthDto from "@core/dtos/auth/elab-backend-auth.dto";

/**
 * ELAB backend interaction service.
 */
@Injectable({
  providedIn: 'root'
})
export class ElabAuthenticationService {
  private static readonly loginUrl = environment.elabApiUrl + '/v1/login';

  // todo: Refactor this into an http config file
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Get auth token from ELAB backend
   * @param verifiablePresentation Verifiable presentation
   * @return Promise<string> Access token if success, error message otherwise.
   */
  login(verifiablePresentation: VerifiablePresentation): Observable<ElabBackendAuthDto> {
    const body = JSON.stringify(verifiablePresentation);
    return this.http.post<ElabBackendAuthDto>(ElabAuthenticationService.loginUrl, body, this.httpOptions);
  }
}
