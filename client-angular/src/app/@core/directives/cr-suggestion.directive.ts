import {
  AbstractControl, AsyncValidatorFn,
  ValidationErrors
} from "@angular/forms";
import { CrService } from "@core/services/cr/cr.service";
import { Observable } from "rxjs";
import { CrSuggestionModel } from "@core/models/cr-suggestion.model";
import { map } from "rxjs/operators";
import User from "@core/models/user.model";



export function crSuggestionValidator(crService: CrService, currentUser: User): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    const suggestionId = control.value.split(/\//).pop();
    return crService.get(suggestionId)
      .pipe(
      map((crSuggestion: CrSuggestionModel | undefined) => {
        if (!crSuggestion) {
          return { suggestionDoesNotExist: true }
        }

        if (!crSuggestion.budget || crSuggestion.budget === 0) {
          return { suggestionHasNoBudget: true }
        }

        if (crSuggestion.creatorDID !== currentUser.did) {
          return { suggestionIsFromDifferentCreator: true }
        }

        return null;
      }
    ))

  }
}
