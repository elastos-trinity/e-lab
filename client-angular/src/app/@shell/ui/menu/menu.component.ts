import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '@pages/auth/services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  path = ROUTER_UTILS.config.base
  proposalPath = ROUTER_UTILS.config.proposals
  adminPath = ROUTER_UTILS.config.admin
  userPath = ROUTER_UTILS.config.user

  constructor(private router: Router, private authService: AuthService) {}

  onClickSignOut(): void {
    this.authService.signOut().then(() => {
        const { root, signIn } = ROUTER_UTILS.config.auth
        this.router.navigate(['/', root, signIn])
      }
    )
  }
}
