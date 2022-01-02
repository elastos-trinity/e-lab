import { Component, OnInit } from "@angular/core";
import User from "@core/models/user.model";
import { ActivatedRoute } from "@angular/router";

@Component({
  templateUrl: './home.page.html',
  styleUrls: ['../../app.component.scss', './home.page.scss'],
})
export class HomePage implements OnInit {
  currentUser!: User

  constructor(private route: ActivatedRoute) { }

  /**
   * - Initialize the current user
   */
  ngOnInit(): void {
    this.route.data.subscribe(({currentUser: user}) => {
      this.currentUser = user;
    });
  }

}
