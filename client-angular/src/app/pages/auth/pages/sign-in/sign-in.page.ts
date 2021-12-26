import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '../../services/auth.service';
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastos-connectivity.service";
import { Container, GradientType, Main } from "tsparticles";
import { loadGradientUpdater } from "tsparticles-updater-gradient";

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



  //  ======= PARTICLES
  id = "tsparticles";
  particlesOptions = {
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse"
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
        }
      }
    },
    particles: {
      collisions: {
        enable: true
      },
      move: {
        direction: "top" as const,
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
        value: 1
      },
      opacity: {
        value: 1,
        random: true
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
    console.log(container);
  }

  particlesInit(main: Main): void {
    console.log(main);
    loadGradientUpdater(main);
  };
}
