import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AuthRoutingModule } from './auth-routing.module';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { NgParticlesModule } from "ng-particles";

@NgModule({
  declarations: [
    SignInPage
  ],
  imports: [CommonModule, AuthRoutingModule, NgParticlesModule],
})
export class AuthModule {}
