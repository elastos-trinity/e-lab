import { Component, OnInit } from "@angular/core";
import User from "@core/models/user.model";
import { Proposal } from "@core/models/proposal.model";
import { ModalService } from "@core/services/modal/modal.service";
import { ActivateAccountComponent } from "@pages/proposals/modals/activate-account.component";
import { ProposalsService } from "@pages/proposals/services/proposals.service";
import { UserService } from "@pages/user/services/user.service";
import { ActivatedRoute } from "@angular/router";
import { VoteService } from "@pages/proposals/services/vote.service";
import { ConfirmVoteComponent } from "@pages/proposals/pages/community-proposals/modals/confirm-vote-component";

@Component({
  templateUrl: './community-proposals.page.html',
  styleUrls: ['community-proposals.page.scss']
})
/**
 * The community proposals page.
 */
export class CommunityProposalsPage implements OnInit {
  currentUser!: User
  proposals!: Array<Proposal>;
  totalProposals!: number;
  totalActiveProposals!: number;
  pageSize!: number;
  pageNum!: number;
  currentVotingPeriod!: { startDate: Date, endDate: Date , isTodayInVotingPeriod: boolean};
  isLoading: boolean;

  constructor (private activateAccountProposalModalService: ModalService<ActivateAccountComponent>,
               private confirmVoteModal: ModalService<ConfirmVoteComponent>,
               private proposalService: ProposalsService,
               private voteService: VoteService,
               private userService: UserService,
               private route: ActivatedRoute) {
    this.isLoading = true;
    this.pageSize = 10;
    this.pageNum = 1;
    this.totalProposals = 0;
    this.proposals = new Array<Proposal>();
  }

  /**
   * - Load proposals
   * - Initialize the current user
   */
  ngOnInit(): void {
    this.voteService.getVotingPeriod().then((response) => {
      this.currentVotingPeriod = response
      this.getActiveProposals();
    });
    this.route.data.subscribe(({currentUser: user}) => {
      this.currentUser = user
    });
  }

  // ============ UI

  /**
   * Display the activate account modal
   */
  async showActivateAccount(): Promise<void> {
    const { ActivateAccountComponent } = await import('../../modals/activate-account.component')
    await this.activateAccountProposalModalService.open(ActivateAccountComponent)
  }

  /**
   * Return true if a previous page is available.
   */
  canDoPreviousPage(): boolean {
    return this.pageNum > 1;
  }

  /**
   * Return true if a next page is available
   */
  canDoNextPage(): boolean {
    return (this.totalProposals - (this.pageNum * this.pageSize)) > 0
  }

  /**
   * Increment the current page number.
   */
  incrementCurrentPage(): void {
    if (this.canDoNextPage()) {
      this.pageNum += 1;
    }
  }

  /**
   * Decrement the current page number.
   */
  decrementCurrentPage(): void {
    if (this.canDoPreviousPage()) {
      this.pageNum -= 1;
    }
  }

  // ============ API CALLS

  /**
   * Get the proposal list
   */
  public getActiveProposals(): void {
    this.proposalService.getActiveProposals(this.pageNum, this.pageSize).subscribe(activeProposalResponse => {
      this.isLoading = false;
      this.proposals = activeProposalResponse.proposals
      this.totalProposals = activeProposalResponse.total
      this.totalActiveProposals = activeProposalResponse.totalActive
    })
  }

  /**
   * Vote for a proposal.
   * @param id proposal ID to vote for.
   */
  async onClickVoteFor(id: string): Promise<void> {
    const { ConfirmVoteComponent } = await import('./modals/confirm-vote-component')
    const modalReference = await this.confirmVoteModal.open(ConfirmVoteComponent, {vote: 'for', proposalId: id})
    modalReference.instance.voteEvent.subscribe(() => { this.getActiveProposals() })
  }

  /**
   * Vote against a proposal.
   * @param id proposal ID to vote against.
   */
  async onClickVoteAgainst(id: string): Promise<void> {
    const { ConfirmVoteComponent } = await import('./modals/confirm-vote-component')
    const modalReference = await this.confirmVoteModal.open(ConfirmVoteComponent, {vote: 'against', proposalId: id})
    modalReference.instance.voteEvent.subscribe(() => { this.getActiveProposals() })
  }
}
