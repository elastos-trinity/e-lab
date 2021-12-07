import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '../../services/auth.service';
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastosConnectivity.service";

@Component({
  templateUrl: './sign-in.page.html',
  styleUrls: ['sign-in.page.scss'],
  encapsulation: ViewEncapsulation.None
})
/**
 * The sign-in page.
 */
export class SignInPage {
  returnUrl: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private elastosConnectivityService: ElastosConnectivityService
  ) {
    this.returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl') || `/${ROUTER_UTILS.config.base.home}`;
  }

  onClickSignIn(): void {
    this.authService.signIn()
    //this.router.navigate([this.returnUrl])
  }
}
