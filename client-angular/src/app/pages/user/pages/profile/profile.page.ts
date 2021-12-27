import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import User from "@core/models/user.model";

@Component({
  templateUrl: './profile.page.html',
  styleUrls: ['../../../../app.component.scss', 'profile.page.scss']
})
/**
 * The profile page.
 */
export class ProfilePage implements OnInit {
  currentUser!: User

  constructor(private route: ActivatedRoute) { }

  /**
   * - Initialize the current user
   */
  ngOnInit(): void {
    this.route.data.subscribe(({currentUser: user}) => {
      this.currentUser = user
    });
  }

}
