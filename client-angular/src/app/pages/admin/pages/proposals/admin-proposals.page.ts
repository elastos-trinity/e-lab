import { Component, OnInit } from "@angular/core";
import User from "@core/models/user.model";
import { GrantStatus, Proposal, ProposalStatus, VotingStatus } from "@core/models/proposal.model";
import { ProposalsService } from "@pages/proposals/services/proposals.service";
import { UserService } from "@pages/user/services/user.service";
import { ActivatedRoute } from "@angular/router";
import { VoteService } from "@pages/proposals/services/vote.service";
import { ROUTER_UTILS } from "@core/utils/router.utils";

@Component({
  templateUrl: './admin-proposals.page.html',
  styleUrls: ['../../../../app.component.scss','../admin.page.scss', 'admin-proposals.page.scss']
})
/**
 * The admin proposals.
 */
export class AdminProposalsPage implements OnInit {
  adminPath = ROUTER_UTILS.config.admin
  currentUser!: User
  proposals!: Array<Proposal>;
  totalProposals!: number;
  totalActiveProposals!: number;
  pageSize!: number;
  pageNum!: number;
  currentVotingPeriod!: { startDate: Date, endDate: Date, isTodayInVotingPeriod: boolean };
  isLoading!: boolean;

  // ENUM imports
  VotingStatus = VotingStatus;
  ProposalStatus = ProposalStatus;
  GrantStatus = GrantStatus;

  constructor (private proposalService: ProposalsService,
               private voteService: VoteService,
               private userService: UserService,
               private route: ActivatedRoute) {
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
    this.isLoading = true
    this.route.data.subscribe(({currentUser: user}) => {
      this.currentUser = user
    });
    this.voteService.getVotingPeriod().then((result) => {
      this.currentVotingPeriod = result
    })
    this.getAdminProposals();
  }

  /**
   * Get the proposal list
   */
  public getAdminProposals(): void {
    this.proposalService.getAllProposals(this.pageNum, this.pageSize)
      .subscribe(myProposalResponse => {
        this.proposals = myProposalResponse.proposals
        this.totalProposals = myProposalResponse.total
        this.totalActiveProposals = myProposalResponse.totalActive
        this.isLoading = false;
      })
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

  /**
   * On click on approve proposal.
   * Send the audit approve request.
   * @param proposalId Proposal ID.
   */
  async onClickApprove(proposalId: string): Promise<void> {
    this.proposalService.approve(proposalId).subscribe(() => {
      this.getAdminProposals()
    })
  }

  /**
   * On click on reject proposal.
   * Send the audit refused request.
   * @param proposalId Proposal ID.
   */
  async onClickReject(proposalId: string): Promise<void> {
    this.proposalService.reject(proposalId).subscribe(() => {
      this.getAdminProposals()
    })
  }

  /**
   * On click on cancel decision.
   * Send the audit null request.
   * @param proposalId Proposal ID.
   */
  async onClickCancelDecision(proposalId: string): Promise<void> {
    this.proposalService.cancelDecision(proposalId).subscribe(() => {
      this.getAdminProposals()
    })
  }

  async onClickGrant(id: string): Promise<void> {
    await this.proposalService.grant(id).then(() => {
      this.getAdminProposals()
    })
  }

  async onClickDontGrant(id: string): Promise<void> {
    await this.proposalService.dontGrant(id).then(() => {
      this.getAdminProposals()
    })
  }

  async onClickCancelGrant(id: string): Promise<void> {
    await this.proposalService.cancelGrant(id).then(() => {
      this.getAdminProposals()
    })
  }
}
