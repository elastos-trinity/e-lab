import { Component, EventEmitter, NgModule, Output, ViewChild } from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "@shell/ui/modal/modal.component";
import { ModalModule } from "@shell/ui/modal/modal.module";
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastos-connectivity.service";
import { KycService } from "@core/services/kyc/kyc.service";

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss'],
})
export class ActivateAccountComponent {
  @ViewChild('modalComponent') modal:
    | ModalComponent<ActivateAccountComponent>
    | undefined;

  isActivationInProcess = false;

  constructor (private elastosConnectivityService: ElastosConnectivityService, private kycService: KycService) {}

  async close(): Promise<void> {
    await this.modal?.close();
  }

  async onClickProvideCredentials(): Promise<void> {
    this.isActivationInProcess = true
    try {
      const kycVerifiablePresentation = await this.elastosConnectivityService.requestKYCCredentials();
      if (!kycVerifiablePresentation) {
        this.isActivationInProcess = false
        return Promise.reject("Error while trying to get the presentation")
      }

      await this.kycService.activate(kycVerifiablePresentation)
      this.isActivationInProcess = false
      return Promise.resolve()
    } catch (error) {
      this.isActivationInProcess = false
      try {
        await this.elastosConnectivityService.disconnect();
      } catch (disconnectError) {
        return Promise.reject(`Error while trying to disconnect wallet connect session ${JSON.stringify(disconnectError)}`);
      }
      return Promise.reject(`Error while requesting credentials ${JSON.stringify(error)}`);
    }
  }

  goToKycMe() {
    window.open("https://kyc-me.io/", "_blank");
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
  ],
  declarations: [ ActivateAccountComponent ],
})
export class ActivateAccountComponentModule {}
