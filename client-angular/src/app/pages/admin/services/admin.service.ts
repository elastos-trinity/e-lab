import { Injectable } from "@angular/core";
import { ElabUserService } from "@core/services/elab/elab-user.service";
import { Observable } from "rxjs";
import { ElabBackendUserListDataDto } from "@core/dtos/users/elab-backend-user-list.dto";

/**
 * This act as our verifier.
 */
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private elabUserService: ElabUserService) {}

  getAllUsers(): Observable<ElabBackendUserListDataDto> {
    return this.elabUserService.get()
  }
}
