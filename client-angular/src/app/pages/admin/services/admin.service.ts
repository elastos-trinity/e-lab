import { Injectable } from "@angular/core";
import { ElabUserService } from "@core/services/elab/elab-user.service";
import { Observable } from "rxjs";
import { ElabBackendUserListDataDto } from "@core/dtos/users/elab-backend-user-list.dto";
import { ElabVotingPeriodService } from "@core/services/elab/elab-voting-period.service";
import moment from "moment";

/**
 * This act as our verifier.
 */
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private elabUserService: ElabUserService, private elabVotingPeriodService: ElabVotingPeriodService) {}

  getAllUsers(): Observable<ElabBackendUserListDataDto> {
    return this.elabUserService.get()
  }

  setUserActive(userId: string): Observable<any> {
    return this.elabUserService.setStatus(userId, 'active');
  }

  setUserInactive(userId: string): Observable<any> {
    return this.elabUserService.setStatus(userId, 'inactive');
  }

}
