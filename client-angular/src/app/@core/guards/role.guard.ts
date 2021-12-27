import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from "@angular/router";
import { UserService } from "@pages/user/services/user.service";
import { ROUTER_UTILS } from "@core/utils/router.utils";

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const currentUser = await this.userService.getLoggedInUser().toPromise()
    if (currentUser) {
      if (route.data.roles && !route.data.roles.includes(currentUser.type)) {
        this.router.navigate([`/${ROUTER_UTILS.config.errorResponse.notFound}`]);
        return Promise.resolve(false);
      }
      return Promise.resolve(true)
    }
    this.router.navigate([`/${ROUTER_UTILS.config.errorResponse.notFound}`]);
    return Promise.resolve(false);
  }
}
