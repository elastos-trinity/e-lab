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
import { AuthGuard, NoAuthGuard, RoleGuard } from "@core/guards";
import { ModalModule } from "@shell/ui/modal/modal.module";
import { CurrentUserResolver } from "@pages/user/resolvers/current-user.resolver";

const APP_ROUTES: Routes = [
  {
    path: ROUTER_UTILS.config.auth.root,
    // eslint-disable-next-line unicorn/no-await-expression-member
    loadChildren: async () => (await import('@pages/auth/auth.module')).AuthModule,
    canLoad: [NoAuthGuard],
  },
  {
    path: ROUTER_UTILS.config.base.home,
    // eslint-disable-next-line unicorn/no-await-expression-member
    loadChildren: async () => (await import('@pages/home/home.module')).HomeModule,
    canLoad: [AuthGuard],
    resolve: {
      currentUser: CurrentUserResolver
    }
  },
  {
    path: ROUTER_UTILS.config.admin.root,
    // eslint-disable-next-line unicorn/no-await-expression-member
    loadChildren: async () => (await import('@pages/admin/admin.module')).AdminModule,
    canLoad: [AuthGuard],
    canActivate: [RoleGuard],
    data: { roles: ['admin', 'superadmin'] },
    resolve: {
      currentUser: CurrentUserResolver
    }
  },
  {
    path: ROUTER_UTILS.config.proposals.root,
    // eslint-disable-next-line unicorn/no-await-expression-member
    loadChildren: async () => (await import('@pages/proposals/proposals.module')).ProposalsModule,
    canLoad: [AuthGuard],
    resolve: {
      currentUser: CurrentUserResolver
    }
  },
  {
    path: ROUTER_UTILS.config.user.root,
    // eslint-disable-next-line unicorn/no-await-expression-member
    loadChildren: async () => (await import('@pages/user/user.module')).UserModule,
    canLoad: [AuthGuard],
    resolve: {
      currentUser: CurrentUserResolver
    }
  },
  {
    path: '**',
    // eslint-disable-next-line unicorn/no-await-expression-member
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
