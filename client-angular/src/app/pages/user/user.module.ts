import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfilePage } from './pages/profile/profile.page';
import { UserRoutingModule } from "@pages/user/user-routing.module";

@NgModule({
  declarations: [
    ProfilePage
  ],
  imports: [
    CommonModule,
    UserRoutingModule
  ]
})
export class UserModule { }
