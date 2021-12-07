import { environment } from "@env/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { VerifiablePresentation } from "@elastosfoundation/did-js-sdk";
import { Injectable } from "@angular/core";

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
  async login(verifiablePresentation: VerifiablePresentation): Promise<string> {
    try {
      const body = JSON.stringify(verifiablePresentation);
      const accessToken = await this.http.post<string>(ElabAuthenticationService.loginUrl, body, this.httpOptions).toPromise();
      if (accessToken === undefined) {
        return Promise.reject("Returned token by ELAB backend service is null");
      }
      return Promise.resolve(accessToken);
    } catch (e) {
      return Promise.reject("Call to ELAB backend service failed.");
    }
  }
}
