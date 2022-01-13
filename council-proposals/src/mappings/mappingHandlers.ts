import {SubstrateExtrinsic,SubstrateEvent,SubstrateBlock} from "@subql/types";
import {Councillor, Proposal, VoteHistory} from "../types";
import { bool, Int } from "@polkadot/types";
import {Balance} from "@polkadot/types/interfaces";


export async function handleCouncilProposedEvent(event: SubstrateEvent): Promise<void> {
    const { event: { data: [accountId, proposalIndex, proposalHash, threshold] } } = event;
    const proposal = new Proposal(proposalHash.toString());
    proposal.index = proposalIndex.toString();
    proposal.account = accountId.toString();
    proposal.hash = proposalHash.toString();
    proposal.voteThreshold = threshold.toString();
    proposal.block = event.block.block.header.number.toBigInt();

    await proposal.save();
}

export async function handleCouncilVotedEvent(event: SubstrateEvent): Promise<void> {
    const { event: { data: [councillorId, proposalHash, approvedVote, numberYes, numberNo] } } = event;
    await ensureCouncillor(councillorId.toString());

    const voteHistory = new VoteHistory(`${event.block.block.header.number.toNumber()}-${event.idx}`);
    voteHistory.proposalHashId = proposalHash.toString();
    voteHistory.approvedVote = (approvedVote as bool).valueOf();
    voteHistory.councillorId = councillorId.toString();
    voteHistory.votedYes = (numberYes as Int).toNumber();
    voteHistory.votedNo = (numberNo as Int).toNumber();
    voteHistory.block = event.block.block.header.number.toNumber();

    await voteHistory.save();
}

async function ensureCouncillor(accountId: string): Promise<void> {
    let councillor = await Councillor.get(accountId);
    if (!councillor) {
        councillor = new Councillor(accountId);
        councillor.numberOfVotes = 0;
    }

    councillor.numberOfVotes += 1;
    await councillor.save();
}