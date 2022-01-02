import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FooterModule } from '../footer/footer.module';
import { MenuModule } from '../menu/menu.module';
import { HeaderModule } from '../header/header.module';
import { LayoutComponent } from './layout.component';
import { ElabLoaderComponent } from "@shell/ui/elab-loader/elab-loader.component";

@NgModule({
  declarations: [LayoutComponent, ElabLoaderComponent],
  imports: [CommonModule, MenuModule, HeaderModule, FooterModule],
  exports: [LayoutComponent, ElabLoaderComponent],
})
export class LayoutModule {}
