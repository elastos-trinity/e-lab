import { Injectable } from "@angular/core";
import { ElabVoteService } from "@core/services/elab/elab-vote.service";

/**
 * ELAB frontend vote service.
 * Middleware between the vote backend service and frontend.
 */
@Injectable({
  providedIn: 'root',
})
export class VoteService {
  constructor(private elabVotingService: ElabVoteService) { }

  /**
   * Vote for a proposal
   * @param proposalId Proposal ID to add the vote for
   */
  voteFor(proposalId: string): Promise<unknown> {
    return this.elabVotingService.create(proposalId, 'for')
  }

  /**
   * Vote against a proposal
   * @param proposalId Proposal ID to add an AGAINST vote
   */
  voteAgainst(proposalId: string): Promise<unknown> {
    return this.elabVotingService.create(proposalId, 'against')
  }
}
