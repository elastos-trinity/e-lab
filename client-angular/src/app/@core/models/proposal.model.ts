import { ElabBackendProposalResult } from "@core/dtos/proposals/elab-backend-proposals-response.dto";

export enum GrantStatus {
  UNDECIDED = 'undecided',
  GRANTED = 'granted',
  NOT_GRANTED = 'notgranted'
}

export enum ProposalStatus {
  NEW = 'new',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum VotingStatus {
  NOT_STARTED = 'not_started',
  ENDED = 'ended',
  ACTIVE = 'active',
  NOT_APPROVED = 'not_approved'
}

export class Proposal {
  private _id: string
  private _title: string
  private _description: string
  private _link: string
  private _creator: string
  private _createdAt: Date

  private _votesFor: number
  private _votesAgainst: number
  private _votingPeriodStartDate: Date
  private _votingPeriodEndDate: Date
  private _votedByUser: boolean
  private _userVote: string

  private _status: ProposalStatus
  private _votingStatus: VotingStatus
  private _grant: GrantStatus

  constructor(id: string, title: string, status: string, grant: string, description: string, link: string, createdAt: Date,
              votesFor = 0, votesAgainst = 0, votingPeriodStartDate = new Date(0),
              votingPeriodEndDate = new Date(0), creator: string, votedByUser: boolean, userVote: string,
              votingStatus: string) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._link = link;
    this._createdAt = createdAt;
    this._creator = creator;

    this._votesFor = votesFor;
    this._votesAgainst = votesAgainst;
    this._votingPeriodStartDate = votingPeriodStartDate
    this._votingPeriodEndDate = votingPeriodEndDate
    this._votedByUser = votedByUser;
    this._userVote = userVote;

    this._status = status as ProposalStatus;
    this._grant = grant as GrantStatus
    this._votingStatus = votingStatus as VotingStatus;
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
  get status(): ProposalStatus {
    return this._status;
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

  get grant(): GrantStatus {
    return this._grant;
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

  get votingStatus(): VotingStatus {
    return this._votingStatus;
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
