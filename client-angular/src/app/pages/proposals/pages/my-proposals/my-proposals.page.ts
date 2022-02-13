import { Component, ComponentRef, OnInit } from "@angular/core";
import { ModalService } from "@core/services/modal/modal.service";
import {
  NewProposalComponent as NewProposalComponentType
} from "@pages/proposals/pages/my-proposals/modals/new-proposal-component";
import { GrantStatus, Proposal, ProposalStatus, VotingStatus } from "@core/models/proposal.model";
import { ProposalsService } from "@pages/proposals/services/proposals.service";
import User from "@core/models/user.model";
import { UserService } from "@pages/user/services/user.service";
import { ActivatedRoute } from "@angular/router";
import { ActivateAccountComponent } from "@pages/proposals/modals/activate-account.component";
import { VoteService } from "@pages/proposals/services/vote.service";

@Component({
  templateUrl: './my-proposals.page.html',
  styleUrls: ['../../../../app.component.scss', 'my-proposals.page.scss']
})
/**
 * The my proposals page.
 */
export class MyProposalsPage implements OnInit {
  currentUser!: User
  proposals!: Array<Proposal>;
  totalProposals!: number;
  totalActiveProposals!: number;
  pageSize!: number;
  pageNum!: number;
  isLoading!: boolean;

  // ENUM imports
  VotingStatus = VotingStatus;
  ProposalStatus = ProposalStatus;
  GrantStatus = GrantStatus;

  inNewProposalModal = false;

  constructor (private createProposalModalService: ModalService<NewProposalComponentType>,
               private voteService: VoteService,
               private activateAccountProposalModalService: ModalService<ActivateAccountComponent>,
               private proposalService: ProposalsService, private userService: UserService, private route: ActivatedRoute) {
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
    this.userService.loggedInUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user
      }
    })
    this.getMyProposals();
  }

  /**
   * Display the new proposal modal
   */
  async openNewProposalModal(): Promise<void> {
    this.inNewProposalModal = true;
    const { NewProposalComponent } = await import('./modals/new-proposal-component')
    const modalReference = await this.createProposalModalService.open(NewProposalComponent) as ComponentRef<NewProposalComponentType>
    modalReference.instance.newProposalEvent.subscribe(() => {
      this.getMyProposals();
      this.createProposalModalService.close();
    })

    modalReference.instance.modalCloseEvent.subscribe(() => {
      this.inNewProposalModal = false;
    })
  }


  /**
   * Display the activate account modal
   */
  async openActivateAccountModal(): Promise<void> {
    const { ActivateAccountComponent } = await import('../../modals/activate-account.component')
    const modalReference = await this.activateAccountProposalModalService.open(ActivateAccountComponent)
    modalReference.instance.accountNewlyActivatedEvent.subscribe(() => {
      this.userService.refreshUserData();
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
  goToNextPage(): void {
    if (this.canDoNextPage()) {
      this.pageNum += 1;
      this.getMyProposals();
    }
  }

  /**
   * Decrement the current page number.
   */
  goToPreviousPage(): void {
    if (this.canDoPreviousPage()) {
      this.pageNum -= 1;
      this.getMyProposals();
    }
  }

  /**
   * Get the proposal list
   */
  public getMyProposals(): void {
    this.isLoading = true;
    this.proposalService.getMyProposals(this.pageNum, this.pageSize)
      .subscribe(myProposalResponse => {
        this.proposals = myProposalResponse.proposals
        this.totalProposals = myProposalResponse.total
        this.totalActiveProposals = myProposalResponse.totalActive
        this.isLoading = false;
      })
  }
}
