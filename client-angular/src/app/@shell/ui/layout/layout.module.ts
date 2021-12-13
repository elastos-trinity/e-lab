import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FooterModule } from '../footer/footer.module';
import { MenuModule } from '../menu/menu.module';
import { HeaderModule } from '../header/header.module';
import { LayoutComponent } from './layout.component';

@NgModule({
  declarations: [LayoutComponent],
  imports: [CommonModule, MenuModule, HeaderModule, FooterModule],
  exports: [LayoutComponent],
})
export class LayoutModule {}
