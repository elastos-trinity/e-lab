import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { CrSuggestionModel } from "@core/models/cr-suggestion.model";
import CrSuggestionResponseDto from "@core/dtos/cr/cr-suggestion-response.dto";

@Injectable({
  providedIn: 'root'
})
export class CrService {
  private static readonly crURL = 'https://api.cyberrepublic.org/api/suggestion/';

  constructor(private http: HttpClient) { }

  get(suggestionId: string): Observable<CrSuggestionModel | undefined> {
    return this.http.get<CrSuggestionResponseDto>(`${CrService.crURL}/${suggestionId}/show?incViewsNum=true`).pipe(
      map(
        (response: CrSuggestionResponseDto) => {
          if (response.code === 1 && !response.data.empty) {
            const crSuggestion = new CrSuggestionModel(Number.parseFloat(response.data.budgetAmount ? response.data.budgetAmount : "0"),
              response.data.createdBy.did.id);
            return crSuggestion;
          } else {
            return undefined;
          }
      }))
  }
}
