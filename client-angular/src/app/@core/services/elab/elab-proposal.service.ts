import { environment } from "@env/environment";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import ElabBackendProposalsResponseDto, {
  ElabBackendProposalResult
} from "@core/dtos/proposals/elab-backend-proposals-response.dto";
import { map } from "rxjs/operators";

export enum GetProposalQueryType {
  ALL = 'all',
  MINE = 'mine',
  ACTIVE = 'active'
}

/**
 * ELAB backend interaction service.
 */
@Injectable({
  providedIn: 'root'
})
export class ElabProposalService {
  private static readonly proposalUrl = environment.elabApiUrl + '/v1/proposal';
  private static readonly proposalsUrl = environment.elabApiUrl + '/v1/proposals';

  constructor(private http: HttpClient) {}

  /**
   * Get auth token from ELAB backend
   *
   * @return Promise<string> Access token if success, error message otherwise.
   * @param body
   */
  create(body: { title: string, link: string, description: string }): Observable<any> {
    return this.http.post(ElabProposalService.proposalsUrl, body);
  }

  find(proposalId: string): Observable<ElabBackendProposalResult> {
    return this.http
      .get<{code: number, message: string, data: ElabBackendProposalResult}>(`${ElabProposalService.proposalsUrl}/${proposalId}`)
      .pipe(map(result => { console.log(result); return result.data }))
  }

  /**
   * Get proposals.
   *
   * @param pageNumber
   * @param pageSize Page size
   * @param type Type of proposal ALL by default
   * @return Observable<ElabGetMineResponseDTO> Observable of ElabGetMineResponseDTO
   */
  get(pageNumber = 1, pageSize = 10, type: GetProposalQueryType = GetProposalQueryType.ACTIVE): Observable<ElabBackendProposalsResponseDto> {
    let url = ElabProposalService.proposalsUrl;
    switch (type) {
      case GetProposalQueryType.MINE: {
        url += '/mine'
        break;
      }
      case GetProposalQueryType.ACTIVE: {
        url += '/active'
        break;
      }
      case GetProposalQueryType.ALL: {
        url += '/all'
        break;
      }
    }

    return this.http.get<ElabBackendProposalsResponseDto>(url, {
      params: {
        'pageNum':  pageNumber.toString(),
        'pageSize':  pageSize.toString()
      }
    })

  }

  /**
   * Should change the backend to a put to match it.
   * @param proposalId
   * @param status
   * @param now Approve the proposal for the current voting period if set to true - Only super admin and testing purpose.
   */
  put(proposalId: string, status: string, now = false):Observable<any> {
    return this.http.put(`${ElabProposalService.proposalUrl}/${proposalId}/audit`, {
      result: status,
      now: now
    })
  }

  /**
   * Grant a proposal
   * @param proposalId Proposal ID concerned
   * @param grantStatus Grant status (granted or notgranted)
   */
  grant(proposalId: string, grantStatus: string): Promise<unknown> {
    return this.http.post<unknown>(`${ElabProposalService.proposalUrl}/${proposalId}/grant`, { grantStatus: grantStatus }).toPromise()
  }
}
