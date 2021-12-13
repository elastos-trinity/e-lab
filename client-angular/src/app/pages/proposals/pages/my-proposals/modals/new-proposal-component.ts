import {Component, NgModule, ViewChild} from '@angular/core';
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

  newProposalForm: FormGroup;

  constructor(
    public fb: FormBuilder,
    private proposalService: ElabProposalService
  ) {
    this.newProposalForm = this.fb.group({
      title: ['', [Validators.required]],
      link: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });
  }

  async createRecord(): Promise<void> {
    console.log(this.newProposalForm.value);

    try {
      const response = await this.proposalService.create(this.newProposalForm.get('title')?.value,
        this.newProposalForm.get('link')?.value, this.newProposalForm.get('description')?.value)
      console.log(response)
      await this.close();
    } catch (e) {
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
