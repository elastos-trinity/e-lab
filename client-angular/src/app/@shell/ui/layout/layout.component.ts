import {
  ChangeDetectionStrategy, Component, ElementRef,
  NgZone, ViewChild, Renderer2, OnInit, AfterViewInit
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
export class LayoutComponent implements OnInit {
  @ViewChild('loaderElement')
  loaderElement!: ElementRef

  @ViewChild('contentElement')
  contentElement!: ElementRef

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private renderer: Renderer2) {
  }

  ngOnInit() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.router.events.subscribe((event:RouterEvent) => {
        if (event instanceof NavigationEnd) {
          this._hideLoader()
        } else if (event instanceof NavigationStart) {
          this._showLoader()
        } else if (event instanceof NavigationError) {
          this._hideLoader()
        } else if (event instanceof NavigationCancel) {
          this._hideLoader()
        }
      })
  }

  private _showLoader(): void {
    this.ngZone.runOutsideAngular(() => {
      this.renderer.setStyle(
        this.loaderElement.nativeElement,
        'display',
        'block'
      );
      this.renderer.setStyle(
        this.contentElement.nativeElement,
        'display',
        'none'
      )
    })
  }

  private _hideLoader(): void {
    this.ngZone.runOutsideAngular(() => {
      this.renderer.setStyle(
        this.loaderElement.nativeElement,
        'display',
        'none'
      );
      this.renderer.setStyle(
        this.contentElement.nativeElement,
        'display',
        'block'
      )
    })
  }

}
