export default interface CrSuggestionResponseDto {
  code: number
  data: Data
  message: string
}

export interface Data {
  signature: Signature
  link: any[]
  version: number
  likes: string[]
  likesNum: number
  dislikes: string[]
  dislikesNum: number
  viewsNum: number
  activeness: number
  comments: Comment[][]
  commentsNum: number
  status: string
  reference: Reference[]
  receivedCustomizedIDList: any[]
  _id: string
  title: string
  type: string
  abstract: string
  motivation: string
  goal: string
  relevance: Relevance[]
  budget: Budget[]
  planIntro: string
  budgetIntro: string
  plan: Plan
  budgetAmount: string
  elaAddress: string
  createdBy: CreatedBy2
  contentType: string
  descUpdatedAt: string
  createdAt: string
  updatedAt: string
  subscribers: Subscriber[]
  tags: any[]
  proposers: any[]
  displayId: number
  __v: number
  draftHash: string
  ownerPublicKey: string
  proposalHash: string
  proposer: Proposer
}

export interface Signature {
  data: string
}

export interface Comment {
  childComment: any[]
  _id: string
  comment: string
  createdBy: CreatedBy
  createdAt: string
}

export interface CreatedBy {
  did: Did
  profile: Profile
  _id: string
  username: string
  email: string
}

export interface Did {
  id: string
  compressedPublicKey: string
}

export interface Profile {
  firstName: string
  lastName: string
}

export interface Reference {
  _id: string
  vid: number
  status: string
  proposalHash: string
  txHash: string
}

export interface Relevance {
  proposal: string
  relevanceDetail: string
  title: string
}

export interface Budget {
  type: string
  amount: string
  criteria: string
  milestoneKey: string
}

export interface Plan {
  milestone: Milestone[]
  teamInfo: TeamInfo[]
}

export interface Milestone {
  date: string
  version: string
}

export interface TeamInfo {
  member: string
  role: string
  responsibility: string
  info: string
}

export interface CreatedBy2 {
  did: Did2
  profile: Profile2
  _id: string
  username: string
  email: string
}

export interface Did2 {
  id: string
  compressedPublicKey: string
  didName: string
}

export interface Profile2 {
  firstName: string
  lastName: string
  avatar: string
}

export interface Subscriber {
  _id: string
  user: string
  lastSeen: string
}

export interface Proposer {
  did: Did3
  profile: Profile3
  _id: string
  username: string
  email: string
}

export interface Did3 {
  id: string
  compressedPublicKey: string
  didName: string
}

export interface Profile3 {
  avatar: string
  firstName: string
  lastName: string
}
