import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import User from "@core/models/user.model";
import { ElabUserService } from "@core/services/elab/elab-user.service";
import { KycService } from "@core/services/kyc/kyc.service";
import {environment} from "@env/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private static readonly userURL = environment.elabApiUrl + '/v1/user';

  public loggedInUser$ = new BehaviorSubject<User>(
    {
      name: "",
      type: "",
      did: "",
      isActive: false,
      discordId: "",
      canManageAdmin: false
    });

  constructor(private elabUserService: ElabUserService, private kycService: KycService) {}

  refreshUserData(): void {
    this.elabUserService.getCurrentUser().subscribe((user) => {
      this.loggedInUser$.next(user);
    })
  }

  /**
   * Get the current user information
   * @return Observable<User> an User observable
   */
  fetchLoggedInUser(): BehaviorSubject<User> {
    this.refreshUserData();
    return this.loggedInUser$;
  }

  activateByDiscord(userId: string, discordId: string): Observable<any> {
    return this.elabUserService.setDiscordId(userId, discordId);
  }

  getActivedUserCount(): Observable<any> {
    return this.elabUserService.count();
  }
}
