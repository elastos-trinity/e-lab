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
import { interval } from "rxjs";

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
  isActivationSuccessful = false;
  timeleft = 5;

  @Output()
  accountNewlyActivatedEvent = new EventEmitter()

  constructor (private elastosConnectivityService: ElastosConnectivityService, private kycService: KycService) { }


  async close(): Promise<void> {
    await this.modal?.close();
  }

  async onClickProvideCredentials(): Promise<void> {
    this.isActivationInProcess = true

    let kycVerifiablePresentation
    try {
      kycVerifiablePresentation = await this.elastosConnectivityService.requestKYCCredentials();

      if (!kycVerifiablePresentation) {
        this.isActivationInProcess = false
        throw new Error("Error while trying to get the presentation")
      }
    } catch (error) {
      try {
        await this.elastosConnectivityService.disconnect();
      } catch (disconnectError) {
        return Promise.reject(`Error while trying to disconnect wallet connect session ${JSON.stringify(disconnectError)}`);
      }
      return Promise.reject(`Error while requesting credentials ${JSON.stringify(error)}`);
    }

    try {
      await this.kycService.activate(kycVerifiablePresentation)
      this.isActivationInProcess = false
      this.isActivationSuccessful = true
      this.accountNewlyActivatedEvent.emit()
      const timeSubscription = interval(1000).subscribe(second => {
        this.timeleft -= second
        if (this.timeleft <= 0 ) {
          timeSubscription.unsubscribe();
          this.close();
        }
      })
      return Promise.resolve();
    } catch (error) {
      this.isActivationInProcess = false
      return Promise.reject(`Error while activating account ${error}`);
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
