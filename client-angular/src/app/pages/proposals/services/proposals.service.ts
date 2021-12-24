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
   * @param pageNum the page number
   * @param pageSize length of the page
   */
  public getActiveProposals(pageNum = 1, pageSize = 10): Observable<GetProposalResponse> {
    return this.elabProposalService.get(pageNum, pageSize, GetProposalQueryType.ACTIVE).pipe(
      map(getProposalResponseDTO => {
        return <GetProposalResponse>{
          proposals: getProposalResponseDTO.data.result.map(Proposal.fromGetProposal),
          total: getProposalResponseDTO.data.total,
          totalActive: getProposalResponseDTO.data.totalActive
        }
      })
    )
  }

  /**
   * Mapper from the ElabBackendGetMineResponseDTO to GetMineResponseDTO
   * @param pageNum the page number
   * @param pageSize length of the page
   */
  public getMyProposals(pageNum = 1, pageSize = 10): Observable<GetProposalResponse> {
    return this.elabProposalService.get(pageNum, pageSize, GetProposalQueryType.MINE).pipe(
      map(getMineResponseDTO => {
        return <GetProposalResponse>{
          proposals: getMineResponseDTO.data.result.map(Proposal.fromGetProposal),
          total: getMineResponseDTO.data.total,
          totalActive: getMineResponseDTO.data.totalActive
        }
      })
    )
  }

  /**
   * Mapper from the ElabBackendGetMineResponseDTO to GetMineResponseDTO
   * @param pageNum the page number
   * @param pageSize length of the page
   */
  public getAdminProposals(pageNum = 1, pageSize = 10): Observable<GetProposalResponse> {
    return this.elabProposalService.get(pageNum, pageSize, GetProposalQueryType.ALL).pipe(
      map(getMineResponseDTO => {
        return <GetProposalResponse>{
          proposals: getMineResponseDTO.data.result.map(Proposal.fromGetProposal),
          total: getMineResponseDTO.data.total
        }
      })
    )
  }

  /**
   * Approve a proposal
   * @param proposalId Proposal ID to approve
   */
  approve(proposalId: string): Promise<unknown> {
    return this.elabProposalService.put(proposalId, 'approved')
  }

  /**
   * Reject a proposal
   * @param proposalId Proposal ID to reject
   */
  reject(proposalId: string): Promise<unknown> {
    return this.elabProposalService.put(proposalId, 'rejected')
  }

  /**
   * Cancel the approval decision
   * @param proposalId Proposal ID to cancel the decision for
   */
  cancelDecision(proposalId: string): Promise<unknown> {
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
