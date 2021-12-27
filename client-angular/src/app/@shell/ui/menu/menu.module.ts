import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuComponent } from './menu.component';
import { NgParticlesModule } from "ng-particles";

@NgModule({
  declarations: [MenuComponent],
  imports: [CommonModule, RouterModule, NgParticlesModule],
  exports: [MenuComponent],
})
export class MenuModule {}
