import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { UserService } from "@pages/user/services/user.service";
import { ROUTER_UTILS } from "@core/utils/router.utils";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree  {
    console.log(`HERE CURRENT USER`)
    const currentUser = this.userService.currentUser$.value
    if (currentUser) {
      if (route.data.roles && route.data.roles.indexOf(currentUser.type) === -1) {
        this.router.navigate([`/${ROUTER_UTILS.config.errorResponse.notFound}`]);
        return false;
      }
      return true
    }
    this.router.navigate([`/${ROUTER_UTILS.config.errorResponse.notFound}`]);
    return false;
  }
}
