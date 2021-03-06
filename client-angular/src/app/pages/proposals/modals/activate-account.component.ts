import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, OnDestroy, Output, ViewChild } from "@angular/core";
import {
  FormControl, FormsModule,
  ReactiveFormsModule, Validators
} from '@angular/forms';
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastos-connectivity.service";
import { KycService } from "@core/services/kyc/kyc.service";
import { VerifiablePresentation } from "@elastosfoundation/did-js-sdk";
import { UserService } from "@pages/user/services/user.service";
import { ModalComponent } from "@shell/ui/modal/modal.component";
import { ModalModule } from "@shell/ui/modal/modal.module";
import { interval } from "rxjs";

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss'],
})
export class ActivateAccountComponent implements OnDestroy {
  @ViewChild('modalComponent') modal:
    | ModalComponent<ActivateAccountComponent>
    | undefined;

  discordId = new FormControl(this.userService.loggedInUser$?.value?.discordId,
    [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(18), Validators.maxLength(18)]);

  isActivationInProcess = false;
  isActivationSuccessful = false;
  timeleft = 5;
  isDiscordIdSubmitInProgress = false;

  @Output()
  accountNewlyActivatedEvent = new EventEmitter()
  isDiscordIdSubmitted = !!this.userService.loggedInUser$.value.discordId;

  constructor(
    private elastosConnectivityService: ElastosConnectivityService,
    private kycService: KycService,
    private userService: UserService,
  ) { }

  async close(): Promise<void> {
    await this.modal?.close();
  }

  async onClickProvideCredentials(): Promise<void> {
    this.isActivationInProcess = true

    let kycVerifiablePresentation: VerifiablePresentation
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
        if (this.timeleft <= 0) {
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

  ngOnDestroy(): void {
    this.accountNewlyActivatedEvent.complete()
  }

  onClickProvideDiscordId() {
    this.isDiscordIdSubmitInProgress = true;
    this.userService.activateByDiscord(this.userService.loggedInUser$.value.did, this.discordId.value).subscribe(() => {
      this.isDiscordIdSubmitted = true;
      this.userService.loggedInUser$.value.discordId = this.discordId.value;
      this.isDiscordIdSubmitInProgress = false;
    });
    return;
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
  ],
  declarations: [ActivateAccountComponent],
})
export class ActivateAccountComponentModule { }
