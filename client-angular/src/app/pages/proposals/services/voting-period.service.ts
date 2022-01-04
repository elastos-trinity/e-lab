import { Injectable } from "@angular/core";
import { ElabVotingPeriodService } from "@core/services/elab/elab-voting-period.service";
import { Observable } from "rxjs";
import moment from "moment";
import { ElabBackendVotingPeriodDto } from "@core/dtos/votingPeriod/elab-backend-voting-period.dto";

/**
 * ELAB frontend vote service.
 * Middleware between the vote backend service and frontend.
 */
@Injectable({
  providedIn: 'root',
})
export class VotingPeriodService {
  constructor(private elabVotingPeriodService: ElabVotingPeriodService) { }

  /**
   * Returns information about the current vote period (start, end)
   */
  getCurrentVotingPeriod(): Observable<ElabBackendVotingPeriodDto> {
    return this.elabVotingPeriodService.get();
  }

  setVotingPeriodToCurrent(): Observable<any> {
    const now = moment().utc(false);
    const startDay = now.date();
    const endDay = now.clone().add(7, "days").endOf('day').date();
    return this.elabVotingPeriodService.put(startDay, endDay);
  }

  setVotingPeriodToFutureDateRange(): Observable<any> {
    const now = moment().utc(false).subtract(8, "days");
    const startDay = now.date();
    const endDay = now.clone().add(7, "days").endOf('day').date();
    return this.elabVotingPeriodService.put(startDay, endDay);
  }

  resetVotingPeriod() {
    return this.elabVotingPeriodService.put(20, 27);
  }
}
