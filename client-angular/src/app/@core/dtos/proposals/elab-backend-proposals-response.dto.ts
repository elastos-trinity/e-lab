export interface ElabBackendProposalResult {
  id: string
  title: string
  link: string
  description: string
  creator: string
  creationTime: number
  status: string
  grant: string
  votesFor: number
  votesAgainst: number
  votingPeriodStartDate: Date
  votingPeriodEndDate: Date
  votedByUser: boolean
  userVote: string
  votingStatus: string
}

interface ElabBackendProposalResults {
  total: number
  totalActive: number
  result: ElabBackendProposalResult[]
}

export default interface ElabBackendProposalsResponseDto {
  code: string
  message: string
  data:  ElabBackendProposalResults
}
