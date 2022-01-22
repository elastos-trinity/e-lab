import { AfterViewInit, Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '../../services/auth.service';
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastos-connectivity.service";
import { Container, GradientType, Main } from "tsparticles";
import { loadGradientUpdater } from "tsparticles-updater-gradient";
import { loadLightInteraction } from "tsparticles-interaction-light";
import anime from "animejs";


@Component({
  templateUrl: './sign-in.page.html',
  styleUrls: ['sign-in.page.scss'],
  encapsulation: ViewEncapsulation.None
})
/**
 * The sign-in page.
 */
export class SignInPage implements OnInit, AfterViewInit {
  isLoggedIn!: boolean;
  isLoading = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private elastosConnectivityService: ElastosConnectivityService,
    private authService: AuthService
  ) { }

  ngAfterViewInit(): void {
    anime({
      targets: '#sign-in path',
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'linear',
      duration: 6000,
      begin: function(anim) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        document
          .querySelector('#sign-in path')
          .setAttribute("stroke", "url(#outside)");
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        document
          .querySelector('#sign-in path')
          .setAttribute("fill", "url(#inside)");
      },
    });


    anime({
      targets: '#sign-in .welcome-message',
      opacity: '1',
      easing: 'easeInOutQuad',
      duration: 3000
    });

    anime({
      targets: '#sign-in .button',
      opacity: '1',
      easing: 'easeInOutQuad',
      duration: 1000
    })

    anime({
      targets: '#sign-in .how-to-sign-in',
      opacity: '1',
      duration: 3000,
      easing: 'easeInOutQuad',
      delay: 500
    })

    setTimeout(function() {
      anime({
        targets: '#sign-in button',
        scale: {
          value: 1,
          duration: 3000,
          easing: 'easeInOutQuart'
        },
      })
    }, 1000);

  }

  async ngOnInit(): Promise<void> {
    if (this.elastosConnectivityService.isAlreadyConnected() && this.authService.isLoggedIn$) {
      await this.elastosConnectivityService.restoreWalletSession()
    }
    this.authService.isLoggedIn$.subscribe((v) => {
      this.isLoggedIn = v;
    })
  }


  async onClickSignIn(): Promise<boolean> {
    try {
      if (this.elastosConnectivityService.isAlreadyConnected()) {
        await this.authService.signOut();
        await this.authService.signIn();
        return this.router.navigate([`/${ROUTER_UTILS.config.base.home}`]);
      } else {
        this.isLoading = true;
        await this.authService.signIn();
        this.isLoading = false;
        return this.router.navigate([`/${ROUTER_UTILS.config.base.home}`]);
      }
    } catch {
      this.isLoading = false;
      return Promise.resolve(false)
    }
  }



  //  ======= PARTICLES
  id = "tsparticles";
  particlesOptions = {
    fpsLimit: 60,
    background: {
      color: '#000B26' as const
    },
    fullScreen: {
      enabled: true,
      zIndex: -1
    },
    interactivity: {
      detect_on: 'window' as const,
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
          parallax: { enable: false, force: 60, smooth: 10 }
        },
        resize: true
      },
      modes: {
        bubble: {
          distance: 400,
          duration: 2,
          opacity: 0.8,
          size: 40
        },
        push: {
          quantity: 4
        },
        repulse: {
          distance: 200,
          duration: 0.4
        },
        light: {
          shadow: {
            enabled: true,
            color: {
              value: "#FF66DD"
            },
            length: 5000
          }
        }
      }
    },
    particles: {
      collisions: {
        enable: true,
        mode: "bounce" as const
      },
      move: {
        direction: "top-left" as const,
        enable: true,
        random: false,
        speed: 4,
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 7
      },
      opacity: {
        value: 0.7,
        random: true,
      },
      shape: {
        type: "circle" as const
      },
      size: {
        random: true,
        value: 100
      },
      gradient: [
        {
          "type": GradientType.linear,
          "colors": [
            {
              "stop":0,
              "value": {
                value: "#FF66DD"
              }
            },
            {
              "stop": 1,
              "value": {
                value: "#FF9838" as const
              }
            }
          ]
        }
      ],
    },
    detectRetina: true
  };

  particlesLoaded(container: Container): void {
  }

  particlesInit(main: Main): void {
    loadGradientUpdater(main);
    loadLightInteraction(main);
  };
}
