import { environment } from "@env/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

/**
 * ELAB backend interaction service.
 */
@Injectable({
  providedIn: 'root'
})
export class ElabProposalService {
  private static readonly proposalUrl = environment.elabApiUrl + '/v1/proposal';

  // todo: Refactor this into an http config file
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Get auth token from ELAB backend
   * @param title Proposal title
   * @param link Proposal link
   * @param description Proposal desc
   * @return Promise<string> Access token if success, error message otherwise.
   */
  async create(title: string, link: string, description: string): Promise<string> {
    try {
      const body = JSON.stringify({title: title, link: link, description: description});
      // todo: Create an access token dto ?
      const response = await this.http.post<any>(ElabProposalService.proposalUrl + '/add', body, this.httpOptions).toPromise();
      if (response === undefined) {
        return Promise.reject("Returned proposal response by ELAB backend service is null");
      }
      return Promise.resolve(response);
    } catch (e) {
      return Promise.reject("Call to ELAB backend service failed.");
    }
  }
}
