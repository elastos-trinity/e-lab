export type VoteChoice = 'for' | 'against';

export type Vote = {
  voter: string, // DID string of the user who voted
  proposalId: string, // Proposal UUID (id field)
  voteTime: number // Timestamp (ms) at which the vote was done
  vote: VoteChoice; // User's choice, for or against the proposal
}