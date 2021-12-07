export class User {
  private _did: string
  private _token: string

  constructor(did: string, token: string) {
    this._did = did;
    this._token = token;
  }

  get did(): string {
    return this._did;
  }

  set did(value: string) {
    this._did = value;
  }

  get token(): string {
    return this._token;
  }

  set token(value: string) {
    this._token = value;
  }
}
