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
   * Add a new vote
   * @param proposalId Proposal ID concerned
   * @param vote Vote (for or against)
   */
  post(proposalId: string, vote: string) {
    return this.http.post<unknown>(`${ElabVoteService.voteUrl}/${proposalId}/vote`,
      { vote: vote })
  }
}
