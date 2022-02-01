export class CrSuggestionModel {

  private _budget: number;
  private _proposerDID: string;

  constructor(budget: number, proposerDID: string) {
    this._budget = budget;
    this._proposerDID = proposerDID;
  }

  get proposerDID(): string {
    return this._proposerDID;
  }

  get budget(): number {
    return this._budget;
  }
}
