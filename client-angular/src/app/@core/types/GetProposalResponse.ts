import { Proposal } from "@core/models/proposal.model";

export default interface GetProposalResponse {
  total: number,
  totalActive: number,
  proposals: Array<Proposal>
}
