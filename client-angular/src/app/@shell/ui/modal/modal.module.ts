import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { ModalComponent } from './modal.component'
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [ModalComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [ModalComponent],
})
export class ModalModule {}
