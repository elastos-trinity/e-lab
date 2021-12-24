import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityProposalsPage } from './pages/community-proposals/community-proposals.page';
import { MyProposalsPage } from './pages/my-proposals/my-proposals.page';
import { ProposalsRoutingModule } from "@pages/proposals/proposals-routing.module";
import { NewProposalComponentModule } from "@pages/proposals/pages/my-proposals/modals/new-proposal-component";
import { CoreModule } from "@core/core.module";
import { ActivateAccountComponentModule } from "@pages/proposals/modals/activate-account.component";

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
    CoreModule
  ]
})
export class ProposalsModule { }
