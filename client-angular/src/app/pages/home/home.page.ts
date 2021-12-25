import { Component, OnInit } from "@angular/core";
import { ThemeList, ThemeService } from '@core/services/theme';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { UserService } from "@pages/user/services/user.service";
import User from "@core/models/user.model";
import { ActivatedRoute } from "@angular/router";

@Component({
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  path = ROUTER_UTILS.config;
  theme = ThemeList;
  currentUser!: User

  constructor(private themeService: ThemeService, private route: ActivatedRoute ) {}

  /**
   * - Initialize the current user
   */
  ngOnInit(): void {
    this.route.data.subscribe(({currentUser: user}) => {
      this.currentUser = user
    });
  }

  onClickChangeTheme(theme: ThemeList): void {
    this.themeService.setTheme(theme);
  }
}
