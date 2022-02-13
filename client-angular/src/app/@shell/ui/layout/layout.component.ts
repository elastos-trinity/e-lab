import {
  ChangeDetectionStrategy, Component, ElementRef,
  NgZone, ViewChild, Renderer2, OnInit, AfterViewInit, ChangeDetectorRef
} from "@angular/core";
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router, RouterEvent
} from "@angular/router";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent implements AfterViewInit {
  @ViewChild('loaderElement')
  loaderElement!: ElementRef

  @ViewChild('contentElement')
  contentElement!: ElementRef

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone,
    private renderer: Renderer2) {
  }

  /**
   * On navigation start - Show loader and hide content
   * On navigation end - Show content and hide loader
   */
  ngAfterViewInit(): void {
    this.zone.run(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.router.events.subscribe((event:RouterEvent) => {
        if (event instanceof NavigationStart) {
          this._showLoader()
        } else if (event instanceof NavigationEnd) {
          this._hideLoader()
        } else if (event instanceof NavigationError) {
          this._hideLoader()
        } else if (event instanceof NavigationCancel) {
          this._hideLoader()
        }
      })
    })
  }

  /**
   * Show the ELAB loader
   * Hide the content block
   * @private
   */
  private _showLoader(): void {
    this.contentElement.nativeElement.classList.add('hidden');
    this.loaderElement.nativeElement.classList.remove('hidden');
  }

  /**
   * Hide the ELAB loader
   * Display the content block
   * @private
   */
  private _hideLoader(): void {
    this.loaderElement.nativeElement.classList.add('hidden');
    this.contentElement.nativeElement.classList.remove('hidden');
  }

}
