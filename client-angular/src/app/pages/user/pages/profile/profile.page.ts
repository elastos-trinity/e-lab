import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import User from "@core/models/user.model";
import { UserService } from "@pages/user/services/user.service";

@Component({
  templateUrl: './profile.page.html',
  styleUrls: ['../../../../app.component.scss', 'profile.page.scss']
})
/**
 * The profile page.
 */
export class ProfilePage implements OnInit {
  currentUser!: User

  constructor(private userService: UserService) { }

  /**
   * - Initialize the current user
   */
  ngOnInit(): void {
    this.userService.loggedInUser$.subscribe((currentUser) => {
      this.currentUser = currentUser;
    })
  }

}
