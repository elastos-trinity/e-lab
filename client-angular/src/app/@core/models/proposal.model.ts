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
  private readonly _id: string
  private readonly _title: string
  private readonly _description: string
  private readonly _link: string
  private readonly _creator: string
  private readonly _createdAt: Date

  private readonly _votesFor: number
  private readonly _votesAgainst: number
  private readonly _score: number
  private readonly _votingPeriodStartDate: Date
  private readonly _votingPeriodEndDate: Date
  private readonly _votedByUser: boolean
  private readonly _userVote: string

  private readonly _status: ProposalStatus
  private readonly _votingStatus: VotingStatus
  private readonly _grant: GrantStatus

  private readonly _budget: number

  /**
   * Proposal
   * @param id ID
   * @param title Title
   * @param description Description
   * @param link Link
   * @param createdAt Created date
   * @param creator Proposer
   * @param votesFor Number of votes for
   * @param votesAgainst Number of votes against
   * @param votingPeriodStartDate Voting period start date
   * @param votingPeriodEndDate Voting period end date
   * @param votedByUser Has the proposal been voted by the user already
   * @param userVote User vote if he voted.
   * @param status Status (approved, rejected, new)
   * @param votingStatus Voting status - Using this we can figure out what is the proposal state (in voting period, ended, starting soon...)
   * @param grant Grant status
   */
  constructor(id: string, title: string, description: string, link: string, createdAt: Date,
              creator: string,
              votesFor = 0, votesAgainst = 0,
              votingPeriodStartDate = new Date(0),
              votingPeriodEndDate = new Date(0),
              votedByUser: boolean,
              userVote: string,
              status: ProposalStatus, votingStatus: VotingStatus, grant: GrantStatus, budget: number) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._link = link;
    this._createdAt = createdAt;
    this._creator = creator;

    this._votesFor = votesFor;
    this._votesAgainst = votesAgainst;
    this._score = votesFor - votesAgainst;
    this._votingPeriodStartDate = votingPeriodStartDate
    this._votingPeriodEndDate = votingPeriodEndDate
    this._votedByUser = votedByUser;
    this._userVote = userVote;

    this._status = status;
    this._votingStatus = votingStatus;
    this._grant = grant;

    this._budget = budget ? budget : 0;
  }

  /**
   * Return a formatted proposal from a GET proposal response.
   * @param elabProposal The GET proposal response from elab.
   */
  static fromGetProposal(elabProposal: ElabBackendProposalResult): Proposal {
    return new Proposal(elabProposal.id,
      elabProposal.title,
      elabProposal.description,
      elabProposal.link,
      new Date(elabProposal.creationTime),
      elabProposal.creator,
      elabProposal.votesFor,
      elabProposal.votesAgainst,
      elabProposal.votingPeriodStartDate,
      elabProposal.votingPeriodEndDate,
      elabProposal.votedByUser,
      elabProposal.userVote,
      elabProposal.status as ProposalStatus,
      elabProposal.votingStatus as VotingStatus,
      elabProposal.grant as GrantStatus,
      elabProposal.budget
      );
  }

  get votesAgainst(): number {
    return this._votesAgainst;
  }

  get votesFor(): number {
    return this._votesFor;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get link(): string {
    return this._link;
  }

  get description(): string {
    return this._description;
  }

  get status(): ProposalStatus {
    return this._status;
  }

  get title(): string {
    return this._title;
  }

  get id(): string {
    return this._id;
  }

  get grant(): GrantStatus {
    return this._grant;
  }

  get creator(): string {
    return this._creator;
  }

  get votedByUser(): boolean {
    return this._votedByUser;
  }

  get userVote(): string {
    return this._userVote;
  }

  get votingStatus(): VotingStatus {
    return this._votingStatus;
  }

  get votingPeriodEndDate(): Date {
    return this._votingPeriodEndDate;
  }

  get votingPeriodStartDate(): Date {
    return this._votingPeriodStartDate;
  }

  get score(): number {
    return this._score;
  }

  get budget(): number {
    return this._budget;
  }

}
