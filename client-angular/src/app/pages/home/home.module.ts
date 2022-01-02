import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from "@angular/router";
import { HomePage } from './home.page';
import { ROUTER_UTILS } from "@core/utils/router.utils";

const routes: Routes = [
  {
    path: ROUTER_UTILS.config.base.home,
    component: HomePage,
    data: { animation: 'HomePage' }
  }
];

@NgModule({
  declarations: [HomePage],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class HomeModule {}
