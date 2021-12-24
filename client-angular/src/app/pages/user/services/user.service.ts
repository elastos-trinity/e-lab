import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import User from "@core/models/user.model";
import { map } from "rxjs/operators";
import CurrentUserDto from "@pages/user/dtos/CurrentUser.dto";

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private static readonly currentUserURL = environment.elabApiUrl + '/v1/currentUser';

  public currentUser$ = new BehaviorSubject<User>({ name: '', type: '', did: '', isActive: false, canManageAdmin: false });

  constructor(private http: HttpClient) {}

  /**
   * Get the current user information
   * @return Observable<User> an User observable
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<CurrentUserDto>(UserService.currentUserURL).pipe(
      map(currentUserResponse => {
        const user: User = {
          did: currentUserResponse.data.did,
          isActive: currentUserResponse.data.active,
          canManageAdmin: currentUserResponse.data.canManageAdmins,
          type: currentUserResponse.data.type,
          name: currentUserResponse.data.name
        }
        this.currentUser$.next(user)
        return user
      }))
  }
}
