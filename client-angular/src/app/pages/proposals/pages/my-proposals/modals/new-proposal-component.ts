import { Component, EventEmitter, NgModule, Output, ViewChild } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "@shell/ui/modal/modal.component";
import { ModalModule } from "@shell/ui/modal/modal.module";
import { ElabProposalService } from "@core/services/elab/elab-proposal.service";
import { ProposalsService } from "@pages/proposals/services/proposals.service";

@Component({
  selector: 'app-new-proposal',
  templateUrl: './new-proposal.component.html',
  styleUrls: ['./new-proposal.component.scss'],
})
export class NewProposalComponent {
  @ViewChild('modalComponent') modal:
    | ModalComponent<NewProposalComponent>
    | undefined;

  @Output()
  newProposalEvent = new EventEmitter()

  message = '';
  loading = false;

  newProposalForm: FormGroup;

  constructor(
    public fb: FormBuilder,
    private elabProposalService: ElabProposalService
  ) {
    this.newProposalForm = this.fb.group({
      title: ['', [Validators.required]],
      link: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  async createRecord(): Promise<void> {
    this.loading = true
    // todo: Test saving message to be removed
    console.log(this.newProposalForm.value);

    try {
      await this.elabProposalService.create(this.newProposalForm.get('title')?.value,
        this.newProposalForm.get('link')?.value,
        this.newProposalForm.get('description')?.value)
      this.newProposalEvent.emit()
      await this.close();
    } catch (e) {
      this.message = 'Something went wrong when creating... Please try again'
      await new Promise(f => setTimeout(f, 1000));
      await this.close();
    }
  }

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
  declarations: [ NewProposalComponent ],
})
export class NewProposalComponentModule {}
