import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import User from "@core/models/user.model";
import { ElabUserService } from "@core/services/elab/elab-user.service";
import { KycService } from "@core/services/kyc/kyc.service";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public loggedInUser$ = new Subject<User>();

  constructor(private elabUserService: ElabUserService, private kycService: KycService) {}

  /**
   * Get the current user information
   * @return Observable<User> an User observable
   */
  fetchLoggedInUser(): Subject<User> {
    console.debug("Getting logged in user infos")
    const user = this.elabUserService.getCurrentUser()
    user.subscribe((user) => {
      this.loggedInUser$.next(user)
    })
    return this.loggedInUser$;
  }
}
