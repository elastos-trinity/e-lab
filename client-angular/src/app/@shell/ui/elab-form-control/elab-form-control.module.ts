import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ElabFormControlComponent } from './elab-form-control.component';
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [ElabFormControlComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [ElabFormControlComponent, ReactiveFormsModule],
})
export class ElabFormControlModule {}
