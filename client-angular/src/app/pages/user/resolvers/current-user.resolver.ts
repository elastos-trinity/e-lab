import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import User from "@core/models/user.model";
import { Observable } from "rxjs";
import { UserService } from "@pages/user/services/user.service";

@Injectable({ providedIn: 'root' })
/**
 * Resolver to be called before each page requiring the current user infos
 */
export class CurrentUserResolver implements Resolve<User> {
  constructor(private userService: UserService) { }

  /**
   * Return the current user
   */
  resolve(): Observable<User> {
    console.debug("Resolver called - Getting logged in user infos")
    return this.userService.getLoggedInUser();
  }
}
