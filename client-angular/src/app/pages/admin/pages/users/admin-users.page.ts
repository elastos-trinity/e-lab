import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ElabUser } from '@core/dtos/users/elab-backend-user-list.dto';
import { ROUTER_UTILS } from "@core/utils/router.utils";
import { AdminService } from "@pages/admin/services/admin.service";
import User from "@core/models/user.model";
import { UserService } from "@pages/user/services/user.service";

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
  currentUser!: User
  isLoading = true;

  constructor(private adminService: AdminService, private userService: UserService) {}

  ngOnInit(): void {
    this.userService.loggedInUser$.subscribe((user) => {
      this.currentUser = user
    });

    this._getAllUsers();
  }

  private _getAllUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe((elabUserList) => {
      this.totalUsers = elabUserList.total;
      this.userList = elabUserList.result;
      this.isLoading = false;
    })
  }

  setActive(userId: string): void {
    this.adminService.setUserActive(userId).subscribe(() => {
        this._getAllUsers();
      });
  }

  setInactive(userId: string): void {
    this.adminService.setUserInactive(userId).subscribe(() => {
      this._getAllUsers();
    });
  }
}
