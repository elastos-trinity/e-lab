import { ElabBackendProposalResult } from "@core/dtos/proposals/elab-backend-proposals-response.dto";

export class Proposal {
  private _id: string
  private _title: string
  private _status: string
  private _description: string
  private _link: string
  private _grant: string
  private _creator: string
  private _createdAt: Date
  private _votesFor: number
  private _votesAgainst: number
  private _votingPeriodStartDate: Date
  private _votingPeriodEndDate: Date
  private _votedByUser: boolean
  private _userVote: string
  private _votingStatus: string

  constructor(id: string, title: string, status: string, grant: string, description: string, link: string, createdAt: Date,
              votesFor = 0, votesAgainst = 0, votingPeriodStartDate = new Date(0),
              votingPeriodEndDate = new Date(0), creator: string, votedByUser: boolean, userVote: string,
              votingStatus: string) {
    this._id = id;
    this._title = title;
    this._status = status;
    this._description = description;
    this._grant = grant
    this._link = link;
    this._createdAt = createdAt;
    this._votesFor = votesFor;
    this._votesAgainst = votesAgainst;
    this._votingPeriodStartDate = votingPeriodStartDate
    this._votingPeriodEndDate = votingPeriodEndDate
    this._creator = creator;
    this._votedByUser = votedByUser;
    this._userVote = userVote;
    this._votingStatus = votingStatus;
  }

  static fromGetProposal(elabProposal: ElabBackendProposalResult): Proposal {
    return new Proposal(elabProposal.id, elabProposal.title, elabProposal.status, elabProposal.grant, elabProposal.description,
      elabProposal.link, new Date(elabProposal.creationTime), elabProposal.votesFor, elabProposal.votesAgainst, elabProposal.votingPeriodStartDate,
      elabProposal.votingPeriodEndDate, elabProposal.creator, elabProposal.votedByUser, elabProposal.userVote, elabProposal.votingStatus);
  }

  get votesAgainst(): number {
    return this._votesAgainst;
  }

  set votesAgainst(value: number) {
    this._votesAgainst = value;
  }

  set votesFor(value: number) {
    this._votesFor = value;
  }

  get votesFor(): number {
    return this._votesFor;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  set createdAt(value: Date) {
    this._createdAt = value;
  }

  get link(): string {
    return this._link;
  }

  set link(value: string) {
    this._link = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }
  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }
  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get grant(): string {
    return this._grant;
  }

  set grant(value: string) {
    this._grant = value;
  }

  get creator(): string {
    return this._creator;
  }

  set creator(value: string) {
    this._creator = value;
  }

  get votedByUser(): boolean {
    return this._votedByUser;
  }

  set votedByUser(value: boolean) {
    this._votedByUser = value;
  }

  get userVote(): string {
    return this._userVote;
  }

  set userVote(value: string) {
    this._userVote = value;
  }

  get votingStatus(): string {
    return this._votingStatus;
  }

  set votingStatus(value: string) {
    this._votingStatus = value;
  }

  get votingPeriodEndDate(): Date {
    return this._votingPeriodEndDate;
  }

  set votingPeriodEndDate(value: Date) {
    this._votingPeriodEndDate = value;
  }
  get votingPeriodStartDate(): Date {
    return this._votingPeriodStartDate;
  }

  set votingPeriodStartDate(value: Date) {
    this._votingPeriodStartDate = value;
  }

}
