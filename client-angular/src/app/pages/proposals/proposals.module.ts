import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityProposalsPage } from './pages/community-proposals/community-proposals.page';
import { MyProposalsPage } from './pages/my-proposals/my-proposals.page';
import { ProposalsRoutingModule } from "@pages/proposals/proposals-routing.module";
import { NewProposalComponentModule } from "@pages/proposals/pages/my-proposals/modals/new-proposal-component";

@NgModule({
  declarations: [
    CommunityProposalsPage,
    MyProposalsPage
  ],
  imports: [
    CommonModule,
    NewProposalComponentModule,
    ProposalsRoutingModule
  ]
})
export class ProposalsModule { }
