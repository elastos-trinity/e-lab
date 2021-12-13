import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '../../services/auth.service';
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastosConnectivity.service";
import { Observable } from "rxjs";

@Component({
  templateUrl: './sign-in.page.html',
  styleUrls: ['sign-in.page.scss'],
  encapsulation: ViewEncapsulation.None
})
/**
 * The sign-in page.
 */
export class SignInPage {
  isLoggedIn!: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private elastosConnectivityService: ElastosConnectivityService
  ) {
    if (this.elastosConnectivityService.isAlreadyConnected() && this.authService.isLoggedIn$) {
      this.elastosConnectivityService.restoreWalletSession().then(() => {
        console.log("Wallet session restored")
      })
    }
    this.authService.isLoggedIn$.subscribe((v) => {
      this.isLoggedIn = v;
    })
  }

  onClickSignIn(): void {
    // If the elastos connectivity session is already existing disconnecting first.
    if (this.elastosConnectivityService.isAlreadyConnected()) {
      this.elastosConnectivityService.disconnect().then(() => {
        this.authService.signIn().then(() =>
          this.router.navigate([`/${ROUTER_UTILS.config.base.home}`])
        )
      })
    } else {
      this.authService.signIn().then(() => this.router.navigate([`/${ROUTER_UTILS.config.base.home}`]))
    }
  }
}
