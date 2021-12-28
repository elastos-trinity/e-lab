import { Component, Input, OnDestroy } from "@angular/core";
import { ElabFormControlModel } from "@core/models/elabform.model";

@Component({
  selector: 'app-elab-form-control',
  templateUrl: './elab-form-control.component.html',
  styleUrls: ['./elab-form-control.component.scss']
})
export class ElabFormControlComponent implements OnDestroy {
  @Input() control!: ElabFormControlModel


  /**
   * Unsubscribe from the form control
   */
  ngOnDestroy() {
    this.control.unsubscribe();
  }

}
