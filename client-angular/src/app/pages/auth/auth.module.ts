import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AuthRoutingModule } from './auth-routing.module';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { LoadingSpinnerComponent } from "@pages/auth/components/loading-spinner.component";

@NgModule({
  declarations: [
    SignInPage,
    LoadingSpinnerComponent
  ],
  imports: [CommonModule, AuthRoutingModule],
})
export class AuthModule {}
