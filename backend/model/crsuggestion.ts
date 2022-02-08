export class Crsuggestion {

  private _budget?: number;
  private _creatorDID: string;

  constructor(budget: number, proposerDID: string) {
    this._budget = budget;
    this._creatorDID = proposerDID;
  }

  get creatorDID(): string {
    return this._creatorDID;
  }

  get budget(): number {
    return this._budget ? this._budget : 0;
  }
}
