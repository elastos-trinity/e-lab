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
  proposalEvent = new EventEmitter()

  message = '';
  loading = false;

  proposalForm: FormGroup;

  constructor(
    public fb: FormBuilder,
    private elabProposalService: ElabProposalService
  ) {
    this.proposalForm = this.fb.group({
      title: ['', [Validators.required]],
      link: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  async createRecord(): Promise<void> {
    this.loading = true
    // todo: Test saving message to be removed
    console.log(this.proposalForm.value);

    try {
      await this.elabProposalService.create(this.proposalForm.get('title')?.value,
        this.proposalForm.get('link')?.value,
        this.proposalForm.get('description')?.value)
      this.proposalEvent.emit()
      await this.close();
    } catch {
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
