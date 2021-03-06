import {
  Claim,
  CredentialDisclosureRequest,
  DIDAccess
} from "@elastosfoundation/elastos-connectivity-sdk-js/typings/did";
import { connectivity, DID as ConnDID, DID } from "@elastosfoundation/elastos-connectivity-sdk-js";
import { VerifiablePresentation } from "@elastosfoundation/did-js-sdk";
import { Injectable } from "@angular/core";
import { EssentialsConnector } from "@elastosfoundation/essentials-connector-client-browser";

/**
 * Elastos Connectivity Service
 *
 * Responsible for interacting with the Elastos Connectivity Client JS SDK
 *
 * Notes on the connectivity client:
 * The connectivity client require first a "connector", a connector is an identity provider (a wallet).
 * In our case Elastos essentials
 * The SDK then use WalletConnect, a web3 standard to connect blockchain wallets to DApps and get infos from the wallet.
 * In our case we are using Essentials as the main connector.
 *
 * The SDK Connectivity is stateful.
 * Stateful in a way that after having initialized and registered the "connector", the sdk register the connector as an in-memory instance.
 * We can then use sdk functions without specifying reference to the connector as it's designed to used the registered connector isntance.
 *
 * todo: Ask if that correct
 *
 * @see https://github.com/elastos/Elastos.Connectivity.Client.JS.SDK/
 */
@Injectable({
 providedIn: 'root'
})
export class ElastosConnectivityService {
  private readonly _connector: EssentialsConnector;
  private readonly TrustedKYCProviders = ["did:elastos:iqjN3CLRjd7a4jGCZe6B3isXyeLy7KKDuK"] // Trinity. Tech KYC DID

  constructor() {
    this._connector = new EssentialsConnector()
    this.registerConnector().then(() => console.debug("Elastos Connectivity SDK connector is initialized"))
  }

  /**
   * Elastos Connectivity Client
   * Register the essential connector
   */
  public async registerConnector(): Promise<void> {
    await connectivity.registerConnector(this._connector)
  }

  /**
   * Disconnect the wallet session
   */
  public async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        return this.isAlreadyConnected() ? this._connector.disconnectWalletConnect() : resolve();
      } catch (error) {
        console.error("Error while disconnecting the wallet", error);
        reject();
      }
    })
  }

  /**
   * Check if the user is already connected via essentials
   */
  public isAlreadyConnected(): boolean {
    const isUsingEssentialsConnector = connectivity.getActiveConnector() && connectivity.getActiveConnector()?.name === this._connector.name;
    return <boolean>isUsingEssentialsConnector && this._connector.hasWalletConnectSession()
  }

  /**
   * Restore the wallet connect session - TODO: should be done by the connector itself?
   */
  public async restoreWalletSession(): Promise<string[]> {
    return this._connector.getWalletConnectProvider().enable()
  }

  /**
   * This function will actually render an UI asking the user to select
   * his wallet. It will not resolve until the user has selected his wallet identity.
   */
  public async getVerifiablePresentation() : Promise<VerifiablePresentation>  {
    const didAccess: DIDAccess = new DID.DIDAccess();
    const nameClaim: Claim = DID.simpleIdClaim("Your name", "name", false)
    const credentialRequest: CredentialDisclosureRequest = { claims: [nameClaim] }
    return didAccess.requestCredentials(credentialRequest);
  }

  /**
   * Get the connector
   */
  get connector(): EssentialsConnector {
    return this._connector
  }

  /**
   * Request the KYC credentials
   */
  async requestKYCCredentials(): Promise<VerifiablePresentation> {
    const didAccess = new ConnDID.DIDAccess();
    return await didAccess.requestCredentials({
      claims: [
        ConnDID.simpleTypeClaim("Your name", "NameCredential", true)
          .withIssuers(this.TrustedKYCProviders)
          .withNoMatchRecommendations([
            { title: "KYC-me.io", url: "https://kyc-me.io", urlTarget: "internal" }
          ]),
        ConnDID.simpleTypeClaim("Your birth date", "BirthDateCredential", true)
          .withIssuers(this.TrustedKYCProviders)
          .withNoMatchRecommendations([
            { title: "KYC-me.io", url: "https://kyc-me.io", urlTarget: "internal" }
          ])
      ]
    });
  }
}
