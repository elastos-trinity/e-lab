import { Component } from '@angular/core';
import { ModalService } from "@core/services/modal/modal.service";
import {
  NewProposalComponent as NewProposalComponentType
} from "@pages/proposals/pages/my-proposals/modals/new-proposal-component";

@Component({
  templateUrl: './my-proposals.page.html',
  styleUrls: ['my-proposals.page.scss']
})
/**
 * The my proposals page.
 */
export class MyProposalsPage {
  constructor (private modalService: ModalService<NewProposalComponentType>) {}

  async showNewProposal(): Promise<void> {
    const { NewProposalComponent } = await import('./modals/new-proposal-component')
    await this.modalService.open(NewProposalComponent)
  }
}
