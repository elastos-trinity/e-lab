import { Component, EventEmitter, NgModule, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule, Validators
} from "@angular/forms";
import { CommonModule } from '@angular/common';
import { ModalComponent } from "@shell/ui/modal/modal.component";
import { ModalModule } from "@shell/ui/modal/modal.module";
import { ElabFormControlModel } from "@core/models/elabform.model";
import { VotingPeriodService } from "@pages/proposals/services/voting-period.service";
import { ElabFormControlModule } from "@shell/ui/elab-form-control/elab-form-control.module";
import { animate, style, transition, trigger } from "@angular/animations";
import { ElabBackendVotingPeriodDto } from "@core/dtos/votingPeriod/elab-backend-voting-period.dto";
import moment from "moment";

@Component({
  selector: 'app-change-voting-period',
  templateUrl: './change-voting-period.component.html',
  styleUrls: ['./change-voting-period.component.scss'],
  animations: [
    trigger('slideInFromBottom', [
      transition(":enter", [
        style({transform: 'translateY(150%)'}),
        animate('{{delay}} ease-in', style({transform: 'none'}))
      ], {params: {delay: '1000ms'}}),
      transition(":leave", [
        style({ transform: 'none'}),
        animate('500ms {{delay}} ease-in', style({transform: 'translateY(150%)'}))
      ], { params: {delay: '1000ms'}})
    ])
  ]
})
export class ChangeVotingPeriodComponent implements OnInit {
  @ViewChild('modalComponent') modal:
    | ModalComponent<ChangeVotingPeriodComponent>
    | undefined;

  @Output()
  modalCloseEvent = new EventEmitter()

  @Output()
  votingPeriodChangeEvent = new EventEmitter()

  public votingPeriodForm!: FormGroup;
  public loading = false;
  private currentVotingPeriod!: ElabBackendVotingPeriodDto;
  public currentStartDay!: string;
  public currentEndDay!: string;

  constructor(
    public fb: FormBuilder,
    private votingPeriodService: VotingPeriodService,
  ) {
  }

  ngOnInit(): void {
    this.votingPeriodService.getCurrentVotingPeriod().subscribe((currentVotingPeriod) => {
      this.currentVotingPeriod = currentVotingPeriod
      this.currentStartDay = moment(this.currentVotingPeriod.startDate).date().toString();
      this.votingPeriodForm.get('startDay')?.setValue(this.currentStartDay);
      this.currentEndDay = moment(this.currentVotingPeriod.endDate).date().toString();
      this.votingPeriodForm.get('endDay')?.setValue(this.currentEndDay);
    })

    this.votingPeriodForm = this.fb.group({
      startDay: new ElabFormControlModel(
        {
          label: 'Start day',
          placeholder: 'Start day (must be less than 29)',
          name: 'startDay',
          validation: {
            required: 'Please enter the start day',
            min: 'Must be more than 0',
            max: 'Must be less than 28',
            pattern: 'Must be a number'
          }
        }, '',
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.min(0),
          Validators.max(28)
        ]
      ),
      endDay: new ElabFormControlModel(
        {
          label: 'End day',
          placeholder: 'End day (must be less than 29)',
          name: 'endDay',
          validation: {
            required: 'Please enter the end day',
            min: 'Must be more than 0',
            max: 'Must be less than 28',
          }
        }, '',
        [
          Validators.required,
          Validators.pattern("^[0-9]*$"),
          Validators.min(0),
          Validators.max(28)
        ]
      )
    });
  }

  async close(): Promise<void> {
    await this.modal?.close();
  }

  async saveVotingPeriod(): Promise<void> {
    if (!this.votingPeriodForm.valid) {
      return;
    }
    this.loading = true
    this.votingPeriodService.setVotingPeriod(
      this.votingPeriodForm.get('startDay')?.value,
      this.votingPeriodForm.get('endDay')?.value
    ).subscribe(() => {
      this.votingPeriodChangeEvent.emit();
      this.close();
    });
  }

  public getControls(): Array<ElabFormControlModel> {
    return Object.values(this.votingPeriodForm.controls) as Array<ElabFormControlModel>
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    ElabFormControlModule
  ],
  declarations: [ ChangeVotingPeriodComponent ],
})

export class ActivateAccountComponentModule {}
