import { UserService } from "@pages/user/services/user.service";
import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import User from "@core/models/user.model";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
/**
 * Resolver to be called before each page requiring the current user infos
 */
export class CurrentUserResolver implements Resolve<User> {
  constructor(private userService: UserService) {}

  /**
   * Return the current user
   */
  resolve(): Observable<User> {
    return this.userService.getCurrentUser();
  }
}
