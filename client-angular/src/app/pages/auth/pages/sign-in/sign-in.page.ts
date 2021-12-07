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
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private elastosConnectivityService: ElastosConnectivityService
  ) {
    if (this.elastosConnectivityService.isAlreadyConnected()) {
      this.elastosConnectivityService.restoreWalletSession().then(() => {
        console.log("Wallet session restored")
      })
    } // Else maybe show the sign in button which we hide by default ?
    // redirect to home if already logged in
    this.authService.isLoggedIn$.subscribe({
      next(isLoggedIn) {
        if (isLoggedIn) {
          router.navigate([`/${ROUTER_UTILS.config.base.home}`])
        }
      }
    })

  }

  onClickSignIn(): void {
    this.authService.signIn()
  }
}
