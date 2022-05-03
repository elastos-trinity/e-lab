import { VerifiableCredential, VerifiablePresentation } from "@elastosfoundation/did-js-sdk";
import { createHash } from 'crypto';
import { SecretConfig } from "../config/env-secret";
import { DataOrError, ErrorType } from "../model/dataorerror";
import { dbService } from "./db.service";

class CredentialsService {
  public async prepareKycActivationFromPresentation(authenticatedDID: string, vp: VerifiablePresentation): Promise<DataOrError<void>> {
    // Check presentation validity (genuine, not tampered)
    let valid = await vp.isValid();
    if (!valid) {
      return { errorType: ErrorType.INVALID_PARAMETER, error: 'Invalid presentation' };
    }

    // Get the presentation holder
    let presentationDID = vp.getHolder().toString();
    if (!presentationDID) {
      return { errorType: ErrorType.INVALID_PARAMETER, error: 'Unable to extract owner DID from the presentation' };
    }

    // Make sure the holder of this presentation is the currently authentified user
    if (authenticatedDID !== presentationDID) {
      return { errorType: ErrorType.FORBIDDEN_ACCESS, error: 'Presentation not issued by the currently authenticated user' };
    }

    let credentials = vp.getCredentials();

    // Name - TODO: use full context type
    let nameCredential = credentials.find(c => c.getType().indexOf("NameCredential") >= 0);
    if (!nameCredential) {
      return { errorType: ErrorType.INVALID_PARAMETER, error: 'No name credential found' };
    }

    if (!this.ensureTrustedKycProvider(nameCredential)) {
      return { errorType: ErrorType.INVALID_PARAMETER, error: 'The issuer of the name credential is unknown or not trusted' };
    }

    // Birth date - TODO: use full context type
    let birthDateCredential = credentials.find(c => c.getType().indexOf("BirthDateCredential") >= 0);
    if (!birthDateCredential) {
      return { errorType: ErrorType.INVALID_PARAMETER, error: 'No birth date credential found' };
    }

    if (!this.ensureTrustedKycProvider(birthDateCredential)) {
      return { errorType: ErrorType.INVALID_PARAMETER, error: 'The issuer of the birth date credential is unknown or not trusted' };
    }

    // Extract identity info from the credentials
    let lastName = nameCredential.getSubject().getProperty("lastName") || "";
    let firstNames = nameCredential.getSubject().getProperty("firstNames") || "";
    let name = `${lastName} ${firstNames}`.trim();

    let birthDate = birthDateCredential.getSubject().getProperty("birthDate") || "";

    // Now that we know we got good credentials, we generate a hash of user's identity.
    let composedIdentity = `${name}${birthDate}`;
    let identityMd5 = createHash('md5').update(composedIdentity).digest("hex");

    // Make sure this hash isn't already used by another user who would use different DIDs
    // to get KYC-ed multiple times.
    let existingUserWithIdentityHash = await dbService.findUserByKYCIdentityHash(identityMd5);
    if (existingUserWithIdentityHash) {
      if (existingUserWithIdentityHash.did !== authenticatedDID)
        return { errorType: ErrorType.INVALID_PARAMETER, error: 'A user with the same KYC-ed information already exists' };
    }

    // Update user with the identity hash info and make him active. It's ok if the user was already active.
    await dbService.activateUserFromKYC(authenticatedDID, identityMd5);

    return {};
  }

  /**
   * Checks if we trust the issuer of a credential as KYC provider.
   */
  private ensureTrustedKycProvider(credential: VerifiableCredential): boolean {
    let credentialIssuer = credential.getIssuer().toString();
    return SecretConfig.KYC.trustedProviders.indexOf(credentialIssuer) >= 0;
  }
}

export const credentialsService = new CredentialsService();