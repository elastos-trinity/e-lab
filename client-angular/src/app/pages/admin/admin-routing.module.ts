import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AdminProposalsPage } from './pages/proposals/admin-proposals.page';
import { AdminUsersPage } from './pages/users/admin-users.page';

const routes: Routes = [
  {
    path: ROUTER_UTILS.config.admin.proposals,
    component: AdminProposalsPage,
    data: { animation: 'AdminProposalsPage' }
  },
  {
    path: ROUTER_UTILS.config.admin.users,
    component: AdminUsersPage,
    data: { animation: 'AdminUsersPage' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
