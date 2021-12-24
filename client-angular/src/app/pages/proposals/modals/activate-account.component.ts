import { Component, EventEmitter, NgModule, Output, ViewChild } from "@angular/core";
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "@shell/ui/modal/modal.component";
import { ModalModule } from "@shell/ui/modal/modal.module";

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss'],
})
export class ActivateAccountComponent {
  @ViewChild('modalComponent') modal:
    | ModalComponent<ActivateAccountComponent>
    | undefined;

  async close(): Promise<void> {
    await this.modal?.close();
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
