import { environment } from "@env/environment";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

/**
 * ELAB backend interaction service.
 */
@Injectable({
  providedIn: 'root'
})
export class ElabVoteService {
  private static readonly voteUrl = environment.elabApiUrl + '/v1/proposal';

  constructor(private http: HttpClient) {}

  /**
   * Get the current voting period
   */
  getVotingPeriod(): Promise<{startDate: Date, endDate: Date, isTodayInVotingPeriod: boolean}> {
    return this.http.get<{startDate: Date, endDate: Date, isTodayInVotingPeriod: boolean}>(`${ElabVoteService.voteUrl}/votingPeriod`).toPromise()
  }

  /**
   * Add a new vote
   * @param proposalId Proposal ID concerned
   * @param vote Vote (for or against)
   */
  create(proposalId: string, vote: string): Promise<unknown> {
    return this.http.post<unknown>(`${ElabVoteService.voteUrl}/${proposalId}/vote`, { vote: vote }).toPromise()
  }

  /**
   * Delete a vote
   * @param proposalId Proposal ID to delete the vote for
   */
  delete(proposalId: string): Promise<unknown> {
    return this.http.delete<unknown>(`${ElabVoteService.voteUrl}/${proposalId}/vote`).toPromise()
  }
}
