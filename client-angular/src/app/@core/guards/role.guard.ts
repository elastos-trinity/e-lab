import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from "@angular/router";
import { UserService } from "@pages/user/services/user.service";
import { ROUTER_UTILS } from "@core/utils/router.utils";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return new Observable<boolean>(obs => {
      this.userService.fetchLoggedInUser().subscribe((user) => {
        if (!user || !route.data.roles.includes(user.type)) {
          obs.next(false)
          this.router.navigate([`/${ROUTER_UTILS.config.errorResponse.notFound}`]);
        } else {
          obs.next(true)
        }
      })
    })
  }
}
