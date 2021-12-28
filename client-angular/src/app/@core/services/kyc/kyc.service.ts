import { Injectable } from '@angular/core';
import { VerifiablePresentation } from "@elastosfoundation/did-js-sdk";
import { environment } from "@env/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class KycService {
  private static readonly kycURL = environment.elabApiUrl + '/v1/user/kycactivation';

  constructor(private http: HttpClient) {
  }

  /**
   * Activate an user account.
   */
  public async activate(presentation: VerifiablePresentation): Promise<void> {
    return await this.http.post<any>(KycService.kycURL, presentation ).toPromise();
  }
}
