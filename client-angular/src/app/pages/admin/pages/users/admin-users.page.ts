import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { ElabUser } from '@core/dtos/users/elab-backend-user-list.dto';
import { ROUTER_UTILS } from "@core/utils/router.utils";
import { AdminService } from "@pages/admin/services/admin.service";
import User from "@core/models/user.model";
import { UserService } from "@pages/user/services/user.service";
import { Subject } from 'rxjs';

@Component({
  templateUrl: './admin-users.page.html',
  styleUrls: ['../../../../app.component.scss', '../admin.page.scss', 'admin-users.page.scss'],
  encapsulation: ViewEncapsulation.None
})
/**
 * The admin proposals.
 */
export class AdminUsersPage implements OnInit, OnDestroy {
  adminPath = ROUTER_UTILS.config.admin
  totalUsers!: number;
  userList!: ElabUser[];
  currentUser!: User
  isLoading = true;

  dtOptions: DataTables.Settings = {
    pagingType: 'full_numbers',
    pageLength: 20,
    paging: true,
    retrieve: true,
    searching: true
  };
  dtTrigger: Subject<any> = new Subject<any>();


  constructor(private adminService: AdminService, private userService: UserService) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 20,
      paging: true,
      retrieve: true,
      searching: true
    };

    this.userService.loggedInUser$.subscribe((user) => {
      this.currentUser = user
    });

    this._getAllUsers();
  }

  private _getAllUsers() {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe((elabUserList) => {
      if (!this.totalUsers) {
        this.dtTrigger.next(elabUserList.result);
      }
      this.totalUsers = elabUserList.total;
      this.userList = elabUserList.result;
      // Calling the DT trigger to manually render the table
      this.isLoading = false;

    })
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
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

  getUserStatus(user: ElabUser): string {
    if (user.active) {
      return 'ACTIVE';
    }
    if (user.pendingActivation) {
      return 'PENDING';
    }
    return 'INACTIVE';
  }
}
