import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ROUTER_UTILS } from '@core/utils/router.utils'
import { CommunityProposalsPage } from './pages/community-proposals/community-proposals.page'
import { MyProposalsPage } from './pages/my-proposals/my-proposals.page'

const routes: Routes = [
  {
    path: ROUTER_UTILS.config.proposals.communityProposals,
    component: CommunityProposalsPage,
    data: { animation: 'CommunityProposalsPage' }
  },
  {
    path: ROUTER_UTILS.config.proposals.myProposals,
    component: MyProposalsPage,
    data: { animation: 'MyProposalsPage' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProposalsRoutingModule {}
