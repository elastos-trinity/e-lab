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
    this.isLoggedIn$.next(false);
    await new Promise<void>(async (resolve, reject) => {
      let verifiablePresentation: VerifiablePresentation;
      try {
        verifiablePresentation = await this.elastosConnectivityService.getVerifiablePresentation();
        if (!verifiablePresentation) {
          reject("User closed modal");
        }
      } catch (error) {
        console.error("Error while getting the verifiable presentation", error);
        try {
          await this.elastosConnectivityService.disconnect();
        } catch (error) {
          console.error("Error while disconnecting the wallet", error);
        }
        reject()
      }

      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.elabService.login(verifiablePresentation).subscribe((loginResponse) => {
          setItem(StorageItem.AccessToken, loginResponse.data);
          setItem(StorageItem.DID, verifiablePresentation.getHolder().getMethodSpecificId());
          this.isLoggedIn$.next(true);
          resolve();
        });
      } catch (error) {
        console.error("Error while logging via ELAB backend", error)
        try {
          await this.elastosConnectivityService.disconnect();
        } catch (error) {
          console.error("Error while disconnecting the wallet", error);
        }
        reject()
      }
    })


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
    removeItem(StorageItem.AccessToken);
    removeItem(StorageItem.DID);
    await new Promise<void>(async (resolve, reject) => {
      try {
        this.isLoggedIn$.next(false);
        try {
          this.elastosConnectivityService.disconnect();
        } catch (error) {
          console.error("Error while disconnecting the wallet", error);
        }
        resolve()
      } catch (error) {
        reject(error);
      }
    });
  }
}
