import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '@pages/auth/services/auth.service';
import { UserService } from "@pages/user/services/user.service";
import User from "@core/models/user.model";
import { Container, GradientType, Main } from "tsparticles";
import { loadGradientUpdater } from "tsparticles-updater-gradient";
import { fromEvent, Observable, Subscription } from "rxjs";

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

  menuOpened = false;

  resizeObservable$!: Observable<Event>
  resizeSubscription$!: Subscription

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

    this.resizeObservable$ = fromEvent(window, 'resize')
    this.resizeSubscription$ = this.resizeObservable$.subscribe( event => {
      this.container.stop();
      this.container.refresh();
    })
  }

  openMenu() {
    this.menuOpened = !this.menuOpened;
  }

  closeMenu() {
    this.menuOpened = false;
  }


  //  ======= PARTICLES
  id = "tsparticles-menu";
  particlesOptions = {
    fpsLimit: 60,
    background: {
      color: '#000B26' as const
    },
    fullScreen: false,
    interactivity: {
      detect_on: "canvas" as const,
      events: {
        onclick: { enable: false, mode: "push" },
        onhover: {
          enable: false,
          mode: "attract",
          parallax: { enable: false, force: 15, smooth: 10 }
        },
        resize: true
      },
      modes: {
        bubble: {
          distance: 400,
          duration: 2,
          opacity: 0.8,
          size: 50,
          speed: 3
        },
        grab: { distance: 200, line_linked: { opacity: 1 } },
        push: { particles_nb: 4 },
        remove: { particles_nb: 2 },
        repulse: { distance: 100, duration: 0.4 }
      }
    },
    particles: {
      collisions: {
        enable: true,
        mode: "bounce" as const
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
        value: 18
      },
      opacity: {
        value: 1,
        random: true,
        anim: {
          enable: true,
          speed: 0.5,
          opacity_min: 0.1,
          sync: false
        }
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

  container!: Container

  particlesLoaded(container: Container): void {
    this.container = container;
  }


  particlesInit(main: Main): void {
    loadGradientUpdater(main);
  };
}
