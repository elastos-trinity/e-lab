import { Component, OnInit } from "@angular/core";
import { ThemeList, ThemeService } from '@core/services/theme';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { UserService } from "@pages/user/services/user.service";

@Component({
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  path = ROUTER_UTILS.config;
  theme = ThemeList;

  constructor(private themeService: ThemeService, private userService: UserService) {}

  onClickChangeTheme(theme: ThemeList): void {
    this.themeService.setTheme(theme);
  }
}
