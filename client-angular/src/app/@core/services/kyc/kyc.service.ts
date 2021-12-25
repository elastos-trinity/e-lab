import { Injectable } from '@angular/core';
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastos-connectivity.service";
import { VerifiablePresentation } from "@elastosfoundation/did-js-sdk";

@Injectable({
  providedIn: 'root'
})
export class KycService {
  constructor(private elastosConnectivityService: ElastosConnectivityService) {}

  /**
   * Activate an user account.
   */
  public async activate(presentation: VerifiablePresentation): Promise<void> {

    console.log("Calling the connectivity SDK to get KYC credentials");

    const did = presentation.getHolder().getMethodSpecificId();

    console.log(`Calling the KYC activation api for ${did}`);
    const response = await fetch(`http://localhost:8080/api/v1/user/kycactivation`, {
      method: "POST",
      body: JSON.stringify(presentation.toJSON())
    });
    console.log(`KYC activation api response:`, response);

    if (response && response.ok) {
      return Promise.resolve();
    } else {
      if (response) {
        console.error(response.statusText, await response.text());
      }
      return Promise.reject(response);
    }
  }
}
