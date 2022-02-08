/**
 * ELAB forms control model
 */
import { AbstractControlOptions, AsyncValidatorFn, FormControl, ValidatorFn } from "@angular/forms";
import { debounceTime, Subscription } from "rxjs";

export interface IExtendedAbstractControl {
  label?: string;
  name: string;
  placeholder?: string;
  type?: string;
  validation?: Record<string, string>;
  errorMessages?: Array<string>;
}

export class ElabFormControlModel extends FormControl implements IExtendedAbstractControl {
  label?: string;
  name: string;
  type?: string;
  placeholder?: string;
  validation?: Record<string, string>;
  errorMessages?: Array<string>;

  private sub!: Subscription;
  private debounce = 500;

  constructor(config: IExtendedAbstractControl, formState: unknown, validatorOrOptions?: ValidatorFn | AbstractControlOptions | ValidatorFn[],
              asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[]) {
    super(formState, validatorOrOptions, asyncValidator);

    this.statusChanges.subscribe(() => {
      this.errorMessages = [];
      if (this.errors && this.dirty) {
        for (const messageKey of Object.keys(this.errors)) {
          if (this.validation && this.validation[messageKey]) {
            this.errorMessages.push(this.validation[messageKey])
          }
        }
      }
    })

    this.sub = this.valueChanges.pipe(
      debounceTime(this.debounce)
    ).subscribe(() => {
      this.errorMessages = [];
      if (this.errors && this.dirty) {
        for (const messageKey of Object.keys(this.errors)) {
          if (this.validation && this.validation[messageKey]) {
            this.errorMessages.push(this.validation[messageKey])
          }
        }
      }
    })
    this.label = config.label;
    this.name = config.name;
    this.placeholder = config.placeholder;
    this.validation = config.validation;
    this.errorMessages = config.errorMessages;
    this.type = config.type;
  }

  public unsubscribe(): void {
    this.sub.unsubscribe();
  }
}
