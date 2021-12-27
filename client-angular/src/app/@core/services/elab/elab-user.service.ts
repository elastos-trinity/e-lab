import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import User from "@core/models/user.model";
import CurrentUserDto from "@pages/user/dtos/current-user.dto";
import ElabBackendUserListDto, { ElabBackendUserListDataDto } from "@core/dtos/users/elab-backend-user-list.dto";
import { map } from "rxjs/operators";
import { environment } from "@env/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ElabUserService {
  private static readonly userURL = environment.elabApiUrl + '/v1';

  constructor(private http: HttpClient) { }

  /**
   * Get the current user information
   * @return Observable<User> an User observable
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<CurrentUserDto>(ElabUserService.userURL + '/currentUser').pipe(
      map(currentUserResponse => {
        const user: User = {
          did: currentUserResponse.data.did,
          isActive: currentUserResponse.data.active,
          canManageAdmin: currentUserResponse.data.canManageAdmins,
          type: currentUserResponse.data.type,
          name: currentUserResponse.data.name
        }
        return user
      }))
  }

  get(): Observable<ElabBackendUserListDataDto> {
    return this.http.get<ElabBackendUserListDto>(ElabUserService.userURL + '/users/list').pipe(
      map(userList => {
        return userList.data
      }))
  }
}
