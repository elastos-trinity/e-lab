import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '../../services/auth.service';
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastos-connectivity.service";

@Component({
  templateUrl: './sign-in.page.html',
  styleUrls: ['sign-in.page.scss'],
  encapsulation: ViewEncapsulation.None
})
/**
 * The sign-in page.
 */
export class SignInPage implements OnInit {
  isLoggedIn!: boolean;
  isLoading = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private elastosConnectivityService: ElastosConnectivityService,
    private authService: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    if (this.elastosConnectivityService.isAlreadyConnected() && this.authService.isLoggedIn$) {
      await this.elastosConnectivityService.restoreWalletSession()
    }
    this.authService.isLoggedIn$.subscribe((v) => {
      this.isLoggedIn = v;
    })
  }


  async onClickSignIn(): Promise<void> {
    try {
      if (this.elastosConnectivityService.isAlreadyConnected()) {
        await this.authService.signOut();
        await this.authService.signIn();
        await this.router.navigate([`/${ROUTER_UTILS.config.base.home}`]);
        return Promise.resolve();
      } else {
        this.isLoading = true;
        await this.authService.signIn();
        await this.router.navigate([`/${ROUTER_UTILS.config.base.home}`]);
        return Promise.resolve();
      }
    } catch {
      this.isLoading = false;
    }
  }
}
