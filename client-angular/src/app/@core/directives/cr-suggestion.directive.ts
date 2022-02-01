import { AbstractControl, NG_VALIDATORS, ValidationErrors, ValidatorFn } from "@angular/forms";
import { Directive } from "@angular/core";
import { CrService } from "@core/services/cr/cr.service";

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[validateCrLink][ngModel]',
  providers: [{ provide: NG_VALIDATORS,
    useValue: validateCrLink,
    multi: true
  }]
})
export class CrSuggestionDirective {

  validator: Function;

  constructor(crService: CrService) {
    this.validator = validateCrLinkFactory(crService);
  }

  validate(c: FormControl) {

  }

}
export function crSuggestionValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    // eslint-disable-next-line unicorn/no-null
    return forbidden ? {forbiddenName: {value: control.value}} : null;
  };
}
