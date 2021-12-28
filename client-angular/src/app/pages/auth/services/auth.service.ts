import { Injectable } from "@angular/core";
import { getItem, removeItem, setItem, StorageItem } from "@core/utils";
import { BehaviorSubject } from "rxjs";
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastos-connectivity.service";
import { VerifiablePresentation } from "@elastosfoundation/did-js-sdk";
import { ElabAuthenticationService } from "@core/services/elab/elab-authentication.service";

/**
 * This act as our verifier.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$ = new BehaviorSubject<boolean>(!!getItem(StorageItem.AccessToken));

  constructor (private elastosConnectivityService: ElastosConnectivityService,
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
      const accessToken: string = await this.elabService.login(verifiablePresentation);
      // todo: return this in the promise and dont set it here
      setItem(StorageItem.AccessToken, accessToken);
      setItem(StorageItem.DID, verifiablePresentation.getHolder().getMethodSpecificId());
      await this.isLoggedIn$.next(true);
      return Promise.resolve();
    } catch (error) {
      console.error("Error while getting credentials", error);
      await this.elastosConnectivityService.disconnect();
      return Promise.reject()
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
  async signOut(): Promise<void> {
    console.debug("Signing out...");
    removeItem(StorageItem.AccessToken);
    try {
      this.isLoggedIn$.next(false);
      return this.elastosConnectivityService.disconnect().then(() => {
        console.debug("Wallet session disconnected");
        return Promise.resolve();
      });
    } catch (error) {
      console.error(`Disconnect failed: ${error}`);
      return Promise.reject(error);
    }
  }
}
