import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '@pages/auth/services/auth.service';
import { UserService } from "@pages/user/services/user.service";
import User from "@core/models/user.model";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit {
  path = ROUTER_UTILS.config.base
  proposalPath = ROUTER_UTILS.config.proposals
  adminPath = ROUTER_UTILS.config.admin
  userPath = ROUTER_UTILS.config.user
  currentUser!: User;

  constructor(private router: Router, private authService: AuthService, private userService: UserService) {}

  onClickSignOut(): void {
    this.authService.signOut().then(() => {
        const { root, signIn } = ROUTER_UTILS.config.auth
        this.router.navigate(['/', root, signIn])
      }
    )
  }

  ngOnInit(): void {
    this.userService.loggedInUser$.subscribe((v) => {
      if (v.type) {
        this.currentUser = v
      }
    })
  }
}
