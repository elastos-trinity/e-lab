import { Injectable } from "@angular/core";
import { getItem, removeItem, setItem, StorageItem } from "@core/utils";
import { BehaviorSubject } from "rxjs";
import { EssentialsService } from "@core/services/essentials/essentials.service";
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastosConnectivity.service";
import { VerifiablePresentation } from "@elastosfoundation/did-js-sdk";
import { ElabAuthenticationService } from "@core/services/elab/elab-authentication.service";

/**
 * This act as our verifier.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$ = new BehaviorSubject<boolean>(!!getItem(StorageItem.AccessToken) && !!getItem(StorageItem.DID));

  constructor (private essentialsService: EssentialsService,
               private elastosConnectivityService: ElastosConnectivityService,
               private elabService: ElabAuthenticationService) {}

  /**
   * Connect the user if successfully check is presentation.
   * Disconnect the essential sessions if something went wrong.
   *
   * @see https://developer.elastos.org/services/did/guides/interactive_operations/
   * @see https://www.w3.org/TR/vc-data-model/
   * @see https://github.com/elastos/Elastos.DID.Method/blob/master/VerifiableClaims/Elastos-Verifiable-Claims-Specification_en.md
   */
  async signIn(): Promise<void> {
    try {
      const verifiablePresentation: VerifiablePresentation = await this.elastosConnectivityService.getVerifiablePresentation();
      console.debug(`Verifiable presentation:  ${verifiablePresentation}`);
      const accessToken: string = await this.elabService.login(verifiablePresentation);
      console.debug(`Access token:  ${accessToken}`);
      setItem(StorageItem.AccessToken, accessToken);
      setItem(StorageItem.DID, verifiablePresentation.getHolder().getMethodSpecificId());
      this.isLoggedIn$.next(true);
    } catch (e) {
      console.error("Error while getting credentials", e);
      await this.essentialsService.disconnect();
    }
  }

  /**
   * Check if user is currently logged in.
   * @return true if user logged in, false otherwise
   */
  get isLoggedIn(): boolean {
    return this.isLoggedIn$.getValue();
  }

  /**
   * Sign out user
   */
  signOut(): void {
    try {
      this.elastosConnectivityService.disconnect().then(() => { console.debug("Wallet session disconnected") });
      removeItem(StorageItem.AccessToken);
      removeItem(StorageItem.DID);
      this.isLoggedIn$.next(false);
    } catch (e) {
      console.error("Disconnect failed");
    }
  }
}
