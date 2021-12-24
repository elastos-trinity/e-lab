import { environment } from "@env/environment";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import ElabBackendProposalResponseDTO from "@core/dtos/proposals/ElabBackendProposalResponseDTO";

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
   * @param title Proposal title
   * @param link Proposal link
   * @param description Proposal desc
   * @return Promise<string> Access token if success, error message otherwise.
   */
  async create(title: string, link: string, description: string): Promise<string> {
    try {
      const body = JSON.stringify({title: title, link: link, description: description});
      const response = await this.http.post<any>(ElabProposalService.proposalUrl + '/add', body).toPromise();
      if (response === undefined) {
        return Promise.reject("Returned proposal response by ELAB backend service is null");
      }
      return Promise.resolve(response);
    } catch (e) {
      return Promise.reject("Call to ELAB backend service failed.");
    }
  }

  /**
   * Get proposals.
   *
   * @param pageNum Page number
   * @param pageSize Page size
   * @param type Type of proposal ALL by default
   * @return Observable<ElabGetMineResponseDTO> Observable of ElabGetMineResponseDTO
   */
  get(pageNum = 1, pageSize = 10, type: GetProposalQueryType = GetProposalQueryType.ACTIVE): Observable<ElabBackendProposalResponseDTO> {
    let url = ElabProposalService.proposalsUrl;
    if (type === GetProposalQueryType.MINE) {
      url += '/mine'
    } else if (type === GetProposalQueryType.ACTIVE) {
      url += '/active'
    } else if (type === GetProposalQueryType.ALL) {
      url += '/all'
    }

    return this.http.get<ElabBackendProposalResponseDTO>(url, {
      params: {
        'pageNum':  pageNum.toString(),
        'pageSize':  pageSize.toString()
      }
    })

  }

  /**
   * Should change the backend to a put to match it.
   * @param proposalId
   * @param status
   * @param period
   */
  put(proposalId: string, status: string): Promise<unknown> {
    return this.http.put<unknown>(`${ElabProposalService.proposalUrl}/${proposalId}/audit`, {
      result: status
    }).toPromise()
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
