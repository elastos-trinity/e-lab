import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { ThemeService } from '@core/services/theme';
import { AuthService } from '@pages/auth/services/auth.service';
import { Observable } from 'rxjs';
import { slideInAnimation } from "@shell/ui/layout/animations";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    slideInAnimation
  ]
})
export class AppComponent implements OnInit, AfterViewChecked {
  isLoggedIn$!: Observable<boolean>;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private changeReference: ChangeDetectorRef,
  ) { }

  ngAfterViewChecked(): void {
    this.changeReference.detectChanges();
  }

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.runGlobalServices();
  }

  private runGlobalServices(): void {
    this.themeService.init();
  }

  prepareRoute(outlet: any) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
