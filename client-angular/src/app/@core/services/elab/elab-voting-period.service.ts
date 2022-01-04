import { environment } from "@env/environment";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable} from "rxjs";
import { ElabBackendVotingPeriodDto } from "@core/dtos/votingPeriod/elab-backend-voting-period.dto";

/**
 * ELAB backend interaction service.
 */
@Injectable({
  providedIn: 'root'
})
export class ElabVotingPeriodService {
  private static readonly votingPeriodUrl = environment.elabApiUrl + '/v1/voting-period';

  constructor(private http: HttpClient) {}

  /**
   * Get the current voting period
   */
  get(): Observable<ElabBackendVotingPeriodDto> {
    return this.http.get<ElabBackendVotingPeriodDto>(`${ElabVotingPeriodService.votingPeriodUrl}`)
  }

  /**
   * Edit the voting period date
   * @param startDay Start day
   * @param endDay End day
   */
  put(startDay: number, endDay: number) {
    return this.http.put(`${ElabVotingPeriodService.votingPeriodUrl}`,
      { startDay: startDay, endDay: endDay })
  }
}
