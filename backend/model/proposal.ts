export type Proposal = {
  id: string; // Our own custom unique identifier for the proposal
  title: string;
  link: string;
  description: string;
  creator: string; // User DID
  creationTime?: number; // Timestamp (ms) at which this approval was created
  status: 'new' | 'approved' | 'rejected';
  grant: 'granted' | 'notgranted' | 'undecided'; // Whether the proposal was granted funds or not, or if admins haven't made a choice yet
  operatedTime?: number; // Timestamp (ms) at which this approval was approved or rejected
  operator?: string; // DID of the admin that approved or rejected the proposal
}