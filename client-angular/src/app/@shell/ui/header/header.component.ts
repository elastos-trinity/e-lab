import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '@pages/auth/services/auth.service';
import { UserService } from "@pages/user/services/user.service";
import User from "@core/models/user.model";
import { BehaviorSubject} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  path = ROUTER_UTILS.config.base;

  isUserInfoUpdated$ = new BehaviorSubject<boolean>(false);

  miniMenuEnabled = false;
  public currentUser!: User;

  constructor(private router: Router, private authService: AuthService, private userService: UserService) {
  }

  async onClickSignOut(): Promise<void> {
    this.authService.signOut().then(() => {
      const { root, signIn } = ROUTER_UTILS.config.auth;
      return this.router.navigate(['/', root, signIn]);
    })
  }

  ngOnInit(): void {
    this.userService.loggedInUser$.subscribe((userInfo) => {
      if (userInfo) {
        this.currentUser = userInfo
        this.isUserInfoUpdated$.next(true)
      }
    })
  }

  showMiniMenu() {
    this.miniMenuEnabled = !this.miniMenuEnabled;
  }
}
