import { Injectable } from "@angular/core";
import { Proposal } from "@core/models/proposal.model";
import { Observable } from "rxjs";
import {
  ElabProposalService,
  GetProposalQueryType
} from "@core/services/elab/elab-proposal.service";
import { map } from "rxjs/operators";
import GetProposalResponse from "@core/types/GetProposalResponse";
import { ElabVoteService } from "@core/services/elab/elab-vote.service";
import { ElabBackendProposalResult } from "@core/dtos/proposals/elab-backend-proposals-response.dto";

/**
 * ELAB frontend proposal service.
 * Middleware between the proposal backend service and frontend.
 */
@Injectable({
  providedIn: 'root',
})
export class ProposalsService {
  constructor(private elabProposalService: ElabProposalService, private elabVotingService: ElabVoteService) { }

  /**
   * Mapper from the ElabBackendGetMineResponseDTO to GetMineResponseDTO
   * @param pageNumber
   * @param pageSize length of the page
   * @param type
   */
  private getProposals(pageNumber = 1, pageSize = 10, type: GetProposalQueryType): Observable<GetProposalResponse> {
    return this.elabProposalService.get(pageNumber, pageSize, type).pipe(
      map(elabBackendProposalResult => {
        return <GetProposalResponse> {
          total: elabBackendProposalResult.data.total,
          totalActive: elabBackendProposalResult.data.totalActive,
          proposals: elabBackendProposalResult.data.result
            .map((element: ElabBackendProposalResult) => Proposal.fromGetProposal(element))
        }
      })
    )
  }

  /**
   * Mapper from the ElabBackendGetMineResponseDTO to GetMineResponseDTO
   * @param pageNumber
   * @param pageSize length of the page
   */
  public getActiveProposals(pageNumber = 1, pageSize = 10): Observable<GetProposalResponse> {
    return this.getProposals(pageNumber, pageSize, GetProposalQueryType.ACTIVE)
  }

  /**
   * Mapper from the ElabBackendGetMineResponseDTO to GetMineResponseDTO
   * @param pageNumber
   * @param pageSize length of the page
   */
  public getMyProposals(pageNumber = 1, pageSize = 10): Observable<GetProposalResponse> {
    return this.getProposals(pageNumber, pageSize, GetProposalQueryType.MINE)
  }

  /**
   * Mapper from the ElabBackendGetMineResponseDTO to GetMineResponseDTO
   * @param pageNumber
   * @param pageSize length of the page
   */
  public getAllProposals(pageNumber = 1, pageSize = 10): Observable<GetProposalResponse> {
    return this.getProposals(pageNumber, pageSize, GetProposalQueryType.ALL)
  }

  /**
   * Approve a proposal
   * @param proposalId Proposal ID to approve
   */
  approve(proposalId: string): Observable<any> {
    return this.elabProposalService.put(proposalId, 'approved')
  }

  /**
   * Reject a proposal
   * @param proposalId Proposal ID to reject
   */
  reject(proposalId: string): Observable<any> {
    return this.elabProposalService.put(proposalId, 'rejected')
  }

  /**
   * Cancel the approval decision
   * @param proposalId Proposal ID to cancel the decision for
   */
  cancelDecision(proposalId: string): Observable<any> {
    return this.elabProposalService.put(proposalId, 'new')
  }

  /**
   * Grant a proposal
   * @param proposalId Proposal ID to grant
   */
  grant(proposalId: string): Promise<unknown> {
    return this.elabProposalService.grant(proposalId, 'granted')
  }

  /**
   * Refuse the grant for a proposal
   * @param proposalId Proposal ID to not grant
   */
  dontGrant(proposalId: string): Promise<unknown>  {
    return this.elabProposalService.grant(proposalId, 'notgranted')
  }

  /**
   * Cancel the grant for a proposal
   * @param proposalId Proposal ID to cancel the grant for
   */
  cancelGrant(proposalId: string): Promise<unknown>  {
    return this.elabProposalService.grant(proposalId, 'undecided')
  }
}
