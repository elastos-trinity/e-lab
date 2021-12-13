import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProposalsPage } from './pages/proposals/admin-proposals.page';
import { AdminUsersPage } from './pages/users/admin-users.page';
import { AdminRoutingModule } from "@pages/admin/admin-routing.module";

@NgModule({
  declarations: [
    AdminProposalsPage,
    AdminUsersPage
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
