export default interface CrSuggestionResponseDto {
  code: number
  data: Data
  message: string
}

export interface Data {
  _id: string
  title: string
  budgetAmount?: string
  createdBy: CreatedBy2
  proposer: Proposer
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
