import { AfterViewInit, Component, OnInit } from "@angular/core";
import User from "@core/models/user.model";
import { ROUTER_UTILS } from "@core/utils/router.utils";
import { UserService } from "@pages/user/services/user.service";
import { ModalService } from "@core/services/modal/modal.service";
import { ActivateAccountComponent } from "@pages/proposals/modals/activate-account.component";
import anime from "animejs";

@Component({
  templateUrl: './home.page.html',
  styleUrls: ['../../app.component.scss', './home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  currentUser!: User
  proposalPath = ROUTER_UTILS.config.proposals

  constructor(private userService: UserService,
              private activateAccountProposalModalService: ModalService<ActivateAccountComponent>,
  ) { }

  ngAfterViewInit(): void {
    // Wrap every letter in a span

    anime.timeline({loop: false})
      .add({
        targets: '#welcome',
        opacity: [0,1],
        easing: "easeInElastic",
        duration: 200
      }).add(
      {
        targets: '#paragraph-1',
        opacity: [0,1],
        duration: 500,
        easing: "easeInOutQuad",
        delay: 200
      }).add(
        {
      targets: '#paragraph-2',
      opacity: [0,1],
      duration: 500,
      easing: "easeInOutQuad",
      delay: 200
    }).add(
      {
        targets: '#paragraph-3',
        opacity: [0,1],
        duration: 500,
        easing: "easeInOutQuad",
        delay: 200
      })
      .add(
      {
        targets: '#paragraph-4',
        opacity: [0,1],
        duration: 500,
        easing: "easeInOutQuad",
        delay: 200
      })
    ;
  }

  /**
   * - Initialize the current user
   */
  ngOnInit(): void {
    this.userService.loggedInUser$.subscribe((user) => {
      this.currentUser = user
    })
  }

  async openActivateAccountModal() {
    const { ActivateAccountComponent } = await import('../proposals/modals/activate-account.component')
    const modalReference = await this.activateAccountProposalModalService.open(ActivateAccountComponent)
    modalReference.instance.accountNewlyActivatedEvent.subscribe(() => {
      this.userService.refreshUserData();
    })
  }
}
