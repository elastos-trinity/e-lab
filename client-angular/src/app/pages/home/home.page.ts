import { Component, OnInit } from "@angular/core";
import User from "@core/models/user.model";
import { ROUTER_UTILS } from "@core/utils/router.utils";
import { UserService } from "@pages/user/services/user.service";
import { ModalService } from "@core/services/modal/modal.service";
import { ActivateAccountComponent } from "@pages/proposals/modals/activate-account.component";

@Component({
  templateUrl: './home.page.html',
  styleUrls: ['../../app.component.scss', './home.page.scss'],
})
export class HomePage implements OnInit {
  currentUser!: User
  proposalPath = ROUTER_UTILS.config.proposals

  constructor(private userService: UserService,
              private activateAccountProposalModalService: ModalService<ActivateAccountComponent>,
  ) { }

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
