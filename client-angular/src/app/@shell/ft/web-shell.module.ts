import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { NotFoundModule } from '@shell/ui/not-found/not-found.module';
import { FooterModule } from '../ui/footer/footer.module';
import { HeaderModule } from '../ui/header/header.module';
import { MenuModule } from '../ui/menu/menu.module';
import { LayoutModule } from '../ui/layout/layout.module';
import { NotFoundPage } from '../ui/not-found/not-found.page';
import { AuthGuard, NoAuthGuard } from "@core/guards";
import { ModalModule } from "@shell/ui/modal/modal.module";

const APP_ROUTES: Routes = [
  {
    path: ROUTER_UTILS.config.auth.root,
    loadChildren: async () => (await import('@pages/auth/auth.module')).AuthModule,
    canLoad: [NoAuthGuard],
  },
  {
    path: ROUTER_UTILS.config.base.home,
    loadChildren: async () => (await import('@pages/home/home.module')).HomeModule,
    canLoad: [AuthGuard],
  },
  {
    path: ROUTER_UTILS.config.admin.root,
    loadChildren: async () => (await import('@pages/admin/admin.module')).AdminModule,
    canLoad: [AuthGuard],
  },
  {
    path: ROUTER_UTILS.config.proposals.root,
    loadChildren: async () => (await import('@pages/proposals/proposals.module')).ProposalsModule,
    canLoad: [AuthGuard],
  },
  {
    path: ROUTER_UTILS.config.user.root,
    loadChildren: async () => (await import('@pages/user/user.module')).UserModule,
    canLoad: [AuthGuard],
  },
  {
    path: '**',
    loadChildren: async () => (await import('@shell/ui/not-found/not-found.module')).NotFoundModule,
    component: NotFoundPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(APP_ROUTES),
    FooterModule,
    MenuModule,
    ModalModule,
    HeaderModule,
    LayoutModule,
    NotFoundModule,
  ],
  exports: [
    RouterModule,
    FooterModule,
    HeaderModule,
    MenuModule,
    ModalModule,
    LayoutModule,
    NotFoundModule,
  ],
})
export class WebShellModule {}
