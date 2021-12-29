import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityProposalsPage } from './pages/community-proposals/community-proposals.page';
import { MyProposalsPage } from './pages/my-proposals/my-proposals.page';
import { ProposalsRoutingModule } from "@pages/proposals/proposals-routing.module";
import { NewProposalComponentModule } from "@pages/proposals/pages/my-proposals/modals/new-proposal-component";
import { CoreModule } from "@core/core.module";
import { ActivateAccountComponentModule } from "@pages/proposals/modals/activate-account.component";
import { ConfirmVoteComponentModule } from "@pages/proposals/pages/community-proposals/modals/confirm-vote-component";
import { ElabFormControlModule } from "@shell/ui/elab-form-control/elab-form-control.module";

@NgModule({
  declarations: [
    CommunityProposalsPage,
    MyProposalsPage
  ],
  imports: [
    CommonModule,
    NewProposalComponentModule,
    ActivateAccountComponentModule,
    ProposalsRoutingModule,
    ConfirmVoteComponentModule,
    CoreModule,
    ElabFormControlModule
  ]
})
export class ProposalsModule { }
