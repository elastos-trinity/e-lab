import { Component, EventEmitter, NgModule, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,

} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "@shell/ui/modal/modal.component";
import { ModalModule } from "@shell/ui/modal/modal.module";
import { ElabProposalService } from "@core/services/elab/elab-proposal.service";
import { ElabFormControlModel } from "@core/models/elabform.model";
import { ElabFormControlModule } from "@shell/ui/elab-form-control/elab-form-control.module";
import { animate, style, transition, trigger } from "@angular/animations";
import { crSuggestionValidator } from "@core/directives/cr-suggestion.directive";
import { CrService } from "@core/services/cr/cr.service";
import { UserService } from "@pages/user/services/user.service";
import User from "@core/models/user.model";

@Component({
  selector: 'app-new-proposal',
  templateUrl: './new-proposal.component.html',
  styleUrls: ['./new-proposal.component.scss'],
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
export class NewProposalComponent implements OnInit, OnDestroy {
  @ViewChild('modalComponent') modal:
    | ModalComponent<NewProposalComponent>
    | undefined;

  @Output()
  newProposalEvent = new EventEmitter()

  @Output()
  modalCloseEvent = new EventEmitter()

  loading = false;

  public proposalForm!: FormGroup;
  private currentUser!: User;

  constructor(
    public fb: FormBuilder,
    private elabProposalService: ElabProposalService,
    private crService: CrService,
    private userService: UserService
  ) {
    this.userService.loggedInUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user
      }
    })
  }

  ngOnDestroy(): void {
    this.modalCloseEvent.emit(true);
  }

  ngOnInit(): void {
    this.proposalForm = this.fb.group({
      link: new ElabFormControlModel(
        {
          label: 'CR Link',
          placeholder: 'CR Link (must be a valid CR suggestion link)',
          name: 'link',
          validation: {
            required: 'Please enter the CR link',
            pattern: 'The link must be a valid CR link',
            suggestionDoesNotExist: 'CR Suggestion does not exist',
            suggestionHasNoBudget: 'CR Suggestion does not have a budget',
            suggestionIsFromDifferentCreator: 'CR Suggestion creator DID does not match'
          }}, '',
        [Validators.required,
          Validators.pattern('(https?://)?(www\.)?(cyberrepublic.org/suggestion/)[a-z0-9].*')
        ],
        crSuggestionValidator(this.crService, this.currentUser)
      ),
      title: new ElabFormControlModel(
        {
          label: 'Title',
          placeholder: 'Proposal title (at least 20 characters)',
          name: 'title',
          validation: {
            required: 'Please enter a title',
            minlength: 'The title must be at least 20 characters'
          }}, '',
        [Validators.required, Validators.minLength(20)]
      ),
      description: new ElabFormControlModel(
        {
          label: 'Description',
          type: 'textarea',
          placeholder: 'CR short description (between 50 and 150 characters)',
          name: 'title',
          validation: {
            required: 'Please enter a short description',
            minlength: 'The description must be at least 50 characters',
            maxlength: 'The description must less than 150 characters'
          }}, '',
        [Validators.required,
          Validators.minLength(50),
          Validators.maxLength(150)
        ]
      ),
    });
  }

  public getControls(): Array<ElabFormControlModel> {
    return Object.values(this.proposalForm.controls) as Array<ElabFormControlModel>
  }

  async createRecord(): Promise<void> {
    this.loading = true
    this.elabProposalService.create({
      title: this.proposalForm.get('title')?.value,
      link: this.proposalForm.get('link')?.value,
      description: this.proposalForm.get('description')?.value
    }).subscribe(() => {
      this.newProposalEvent.emit();
    });
  }

  async close(): Promise<void> {
    await this.modal?.close();
  }
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    ElabFormControlModule
  ],
  declarations: [ NewProposalComponent ],
})
export class NewProposalComponentModule {}
