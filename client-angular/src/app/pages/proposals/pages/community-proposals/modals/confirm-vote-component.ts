import { Component, EventEmitter, Input, NgModule, OnInit, Output, ViewChild } from "@angular/core";
import { CommonModule } from '@angular/common';
import { ModalComponent } from "@shell/ui/modal/modal.component";
import { ModalModule } from "@shell/ui/modal/modal.module";
import { ElabProposalService } from "@core/services/elab/elab-proposal.service";
import { ElabBackendProposalResult } from "@core/dtos/proposals/elab-backend-proposals-response.dto";
import { VoteService } from "@pages/proposals/services/vote.service";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-confirm-vote',
  templateUrl: './confirm-vote.component.html',
  styleUrls: ['./confirm-vote.component.scss'],
  animations: [
    trigger('slideInFromBottom', [
      transition(":enter", [
        style({transform: 'translateY(150%)'}),
        animate('{{delay}} ease-in', style({transform: 'none'}))
      ], {params: {delay: '1000ms'}}),
      transition(":leave", [
        style({ transform: 'none'}),
        animate('500ms {{delay}} ease-in', style({transform: 'translateY(150%)'}))
      ], { params: {delay: '1000ms'}})
    ])
  ]
})
export class ConfirmVoteComponent implements OnInit {
  loading = false;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @Input() proposalId: string;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @Input() vote;

  @ViewChild('modalComponent') modal:
    | ModalComponent<ConfirmVoteComponent>
    | undefined;

  @Output()
  voteEvent = new EventEmitter()

  proposal!: ElabBackendProposalResult;

  constructor(
    private elabProposalService: ElabProposalService,
    private voteService: VoteService,
  ) { }

  async confirmVote(): Promise<void> {
    this.loading = true;
    if (this.vote === 'for') {
      await this.voteService.voteFor(this.proposalId)
    } else if (this.vote === 'against') {
      await this.voteService.voteAgainst(this.proposalId)
    }
    this.loading = false;
    this.voteEvent.emit()
    this.close();
  }

  async close(): Promise<void> {
    await this.modal?.close();
  }

  ngOnInit(): void {
    this.elabProposalService.find(this.proposalId.toString()).subscribe((result) => {
        this.proposal = result
      }
    )
  }
}

@NgModule({
  imports: [
    CommonModule,
    ModalModule,
  ],
  declarations: [ ConfirmVoteComponent ],
})
export class ConfirmVoteComponentModule {}
