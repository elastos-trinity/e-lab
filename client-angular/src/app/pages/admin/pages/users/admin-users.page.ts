import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ElabUser } from '@core/dtos/users/elab-backend-user-list.dto';
import { ROUTER_UTILS } from "@core/utils/router.utils";
import { AdminService } from "@pages/admin/services/admin.service";

@Component({
  templateUrl: './admin-users.page.html',
  styleUrls: ['../../../../app.component.scss', '../admin.page.scss', 'admin-users.page.scss'],
  encapsulation: ViewEncapsulation.None
})
/**
 * The admin proposals.
 */
export class AdminUsersPage implements OnInit {
  adminPath = ROUTER_UTILS.config.admin
  totalUsers!: number;
  userList!: ElabUser[];
  isLoading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAllUsers().subscribe((elabUserList) => {
      this.totalUsers = elabUserList.total;
      this.userList = elabUserList.result;
      this.isLoading = false;
    })
  }
}
