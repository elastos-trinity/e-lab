import { JSONObject } from "@elastosfoundation/did-js-sdk";
import { MongoClient } from "mongodb";
import { SecretConfig } from "../config/env-secret";
import logger from "../logger";
import { Proposal } from "../model/proposal";
import { ProposalGrant } from "../model/proposalgrant";
import { ProposalStatus } from "../model/proposalstatus";
import { CommonResponse } from "../model/response";
import { User, UserType } from "../model/user";
import { Vote, VoteChoice } from "../model/vote";
import moment from "moment";
import dayjs from "dayjs";

class DBService {
    private client!: MongoClient;

    async connect(): Promise<void> {
        let mongoConnectionUrl;
        if (SecretConfig.Mongo.user)
            mongoConnectionUrl = `mongodb://${SecretConfig.Mongo.user}:${SecretConfig.Mongo.password}@${SecretConfig.Mongo.host}:${SecretConfig.Mongo.port}/${SecretConfig.Mongo.dbName}?authSource=admin`;
        else
            mongoConnectionUrl = `mongodb://${SecretConfig.Mongo.host}:${SecretConfig.Mongo.port}/${SecretConfig.Mongo.dbName}`;

        try {
            this.client = new MongoClient(mongoConnectionUrl,
              {
                  //useNewUrlParser: true,
                  //useUnifiedTopology: true,
                  minPoolSize: 10,
                  maxPoolSize: 50
              }
            )
            await this.client.connect();
            return Promise.resolve();
        } catch (ex) {
            console.error(ex);
            return Promise.reject();
        }
    }

    constructor() { }

    public async checkConnect(): Promise<CommonResponse<void>> {
        try {
            await this.client.db().collection('users').find({}).limit(1);
            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 200, message: 'mongodb connect failed' };
        }
    }

    public async updateUser(did: string, name: string, email: string): Promise<number> {
        try {
            const collection = this.client.db().collection('users');
            let result = await collection.updateOne({ did }, { $set: { name, email } });
            return result.matchedCount;
        } catch (err) {
            logger.error(err);
            return -1;
        }
    }

    /**
     * Updates telegram user name and ID and returns an activation code.
     * When the telegram UID is changed, the user becomes not active until he confirms
     * the code (in case the uid is changed after the user was confirmed one).
     */
    public async setTelegramUserInfo(did: string, telegramUserName: string, telegramUserId: string): Promise<CommonResponse<string | null>> {
        try {
            const usersCollection = this.client.db().collection('users');

            // Make sure the telegram user ID format is right
            if (!/^[0-9]+$/.test(telegramUserId)) {
                return {
                    code: 403,
                    message: `Invalid telegram user ID format. Digits only`,
                    data: null
                };
            }

            // Make sure the telegram user id is not already in use by another user
            let otherUserWithSameTelegramUID = await usersCollection.findOne({
                did: { $ne: did },
                telegramUserId
            });
            if (otherUserWithSameTelegramUID) {
                return {
                    code: 401,
                    message: `Telegram UID already used by user ${otherUserWithSameTelegramUID.did}`,
                    data: null
                };
            }

            let telegramVerificationCode = new String((1000000 + (Math.random() * 10000000))).slice(0, 6);
            let result = await usersCollection.updateOne({ did }, {
                $set: {
                    telegramUserName,
                    telegramUserId,
                    telegramVerificationCode,
                    active: false
                }
            });
            if (result.matchedCount == 0)
                return {
                    code: 404,
                    message: "User not found",
                    data: null
                };
            else {
                return {
                    code: 200,
                    message: "success",
                    data: telegramVerificationCode
                };
            }
        } catch (err) {
            logger.error(err);
            return {
                code: 500,
                message: "Server error",
                data: null
            };
        }
    }

    /**
    * Attempt to verify the telegram verification code from the user.
    * If the code is right, marks a user as active, meaning that he can now
    * vote.
    */
    public async setTelegramVerificationCode(did: string, code: string) {
        try {
            await this.client.connect();
            const collection = this.client.db().collection('users');

            // Get real user's verification code
            let user = await collection.findOne({ did });
            if (!user) {
                return { code: 404, message: 'User not found' };
            }
            let rightCode = user.telegramVerificationCode;
            if (rightCode !== code) {
                return { code: 403, message: 'Invalid verification code' };
            }

            // The code is right, user can become active
            await collection.updateOne({ did }, { $set: { active: true } });

            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    public async setUserType(targetDid: string, type: UserType) {
        try {
            const collection = this.client.db().collection('users');

            let user = await collection.findOne({ did: targetDid });
            if (!user) {
                return { code: 404, message: 'User not found' };
            }

            await collection.updateOne({ did: targetDid }, { $set: { type } });

            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    public async activateUserFromKYC(targetDid: string, kycIdentityHash: string) {
        console.log(`Activating user ${targetDid} with identity hash ${kycIdentityHash}`);

        try {
            const collection = this.client.db().collection('users');

            await collection.updateOne({ did: targetDid }, { $set: { kycIdentityHash, active: true } });

            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    public async findUserByDID(did: string): Promise<User | null> {
        try {
            const collection = this.client.db().collection<User>('users');
            return (await collection.find({ did }).project<User>({ '_id': 0 }).limit(1).toArray())[0];
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    public async findUserByKYCIdentityHash(kycIdentityHash: string): Promise<User | null> {
        try {
            const collection = this.client.db().collection<User>('users');
            let user = await collection.findOne({ kycIdentityHash }) || null;
            return user;
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    public async addUser(user: User): Promise<CommonResponse<void>> {
        try {
            const collection = this.client.db().collection('users');
            const docs = await collection.find({ did: user.did }).toArray();
            if (docs.length === 0) {
                await collection.insertOne(user);
                return { code: 200, message: 'success' };
            } else {
                return { code: 400, message: 'DID or Telegram exists' }
            }
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    public async removeUser(did: string) {
        try {
            const collection = this.client.db().collection('users');
            let result = await collection.deleteOne({ did });
            if (result.deletedCount === 1) {
                return { code: 200, message: 'success' };
            } else {
                return { code: 400, message: 'DID not exists' }
            }
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    public async listUsers(search: string, pageNum: number, pageSize: number) {
        let query = {};
        if (search && search !== "") {
            Object.assign(query, {
                $or: [
                    { did: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { telegramUserName: { $regex: search, $options: 'i' } }
                ]
            })
        }

        try {
            const collection = this.client.db().collection('users');
            let total = await collection.find(query).count();
            logger.info("Getting list of users with query", query);
            let result = await collection.find(query).sort({ creationTime: -1 }).project({ "_id": 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    public async addUserWallet(targetDid: string, walletAddress: string) {
        console.log(`Binding wallet address ${walletAddress} to user ${targetDid}`);

        try {
            const collection = this.client.db().collection('users');

            await collection.updateOne({ did: targetDid }, { $push: { wallets: walletAddress } });

            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }


    /**
     *
     * @param id
     * @param status
     * @param operator
     * @param now Activate the proposal for the current voting period - Only used for testing
     */
    public async auditProposal(id: string, status: ProposalStatus, operator: string, now: boolean, isSuperAdmin: boolean) {
        try {
            const collection = this.client.db().collection('proposals');
            if (status === 'new' && await this.isProposalInVotingPeriod(id) && !isSuperAdmin) {
                return { code: 400, message: 'can not cancel a decision for a proposal already in a voting period' }
            }
            const votingPeriod = !now ?
              await this.getVotingPeriod(true):
              await this.getVotingPeriod(false) // Always set the next voting period when approving a proposal
            const result = await collection.updateOne({ id },
              { $set: {
                      status,
                      operator,
                      operatedTime: Date.now(),
                      votingPeriodStartDate: status === 'new' ? null : votingPeriod.startDate, // reset the date if we cancel the decision
                      votingPeriodEndDate: status === 'new' ? null : votingPeriod.endDate
                  } });
            if (result.matchedCount === 1) {
                return { code: 200, message: 'success' };
            } else {
                return { code: 400, message: 'proposal not exists or not in proper status' }
            }
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    public async grantProposal(id: string, grant: ProposalGrant, operator: string) {
        try {
            const collection = this.client.db().collection('proposals');
            let result = await collection.updateOne({ id },
                { $set: { grant, operator, operatedTime: Date.now() } });
            if (result.matchedCount === 1) {
                return { code: 200, message: 'success' };
            } else {
                return { code: 400, message: 'proposal doesn\'t exist' }
            }
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    public async addProposal(proposal: Proposal) {
        // it should not be the db service to do the work here, we will need a proposal service that will take of all this.
        if (proposal.title.length < 20) {
            return { code: 400, message: 'Title is less than 20 chars' };
        }
        if (proposal.description.length < 50 || proposal.description.length > 150) {
            return { code: 400, message: 'The proposal description do not match requirements (more than 50 chars and less than 150)' };
        }
        if (!/^(https?:\/\/)?(www\.)?(cyberrepublic\.org\/suggestion\/)[a-z0-9].*$/.test(proposal.link)) {
            return { code: 400, message: 'Invalid CR link'};
        }

        try {
            const collection = this.client.db().collection('proposals');
            await collection.insertOne(proposal);
            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    // TODO: creator is really string?
    public async listUsersProposal(creator: string, pageNum: number, pageSize: number) {
        try {
            const collection = this.client.db().collection('proposals');
            let total = await collection.find({ creator }).count();
            const totalActive = await this.getTotalActiveProposals();

            let result = await collection.find({ creator }, { sort: { creationTime: -1 } }).project({ '_id': 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            const votesCollection = this.client.db().collection('votes');
            for (let proposal of result) {
                let proposalVotes = (await votesCollection.aggregate([
                    { "$match": { proposalId: proposal.id } },
                    { "$project": { proposalId: 1, voteFor: { $cond: [{ $eq: ["$vote", 'for'] }, 1, 0] }, voteAgainst: { $cond: [{ $eq: ["$vote", 'against'] }, 1, 0] } } },
                    { "$group": { "_id": "$proposalId", "votesFor": { "$sum": "$voteFor" }, "votesAgainst": { "$sum": "$voteAgainst" } } }
                ]).toArray())[0];

                if (!proposalVotes) {
                    // No vote yet
                    proposal["votesFor"] = 0;
                    proposal["votesAgainst"] = 0;
                }
                else {
                    proposal["votesFor"] = proposalVotes["votesFor"];
                    proposal["votesAgainst"] = proposalVotes["votesAgainst"];
                }

                proposal["votingStatus"] = await this.getProposalVotingStatus(proposal)
            }
            return { code: 200, message: 'success', data: { total, result, totalActive } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    /**
     * Find a proposal by ID
     * @param id
     */
    public async findProposalById(id: string) {
        if (!id) {
            return { code: 500, message: 'Proposal ID required' };
        }
        let query: JSONObject = { id: id };
        try {
            const collection = this.client.db().collection('proposals');
            let proposal = await collection.findOne(query);
            logger.info("Proposal", proposal);
            return { code: 200, message: 'success', data: proposal };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    public async listProposals(title: string, activeOnly: boolean, userId: string, pageNum: number, pageSize: number) {
        let query: object;
        if (activeOnly) { // Active proposals are defined both by an approved status and a voting period set for the proposal.
            query = {
                status: "approved",
                votingPeriodStartDate: { $ne: null },
                votingPeriodEndDate: { $ne: null }
            };
        } else {
            query = {}; // all
        }

        if (title) {
            // @ts-ignore
            query.title = title;
        }

        try {
            const collection = this.client.db().collection('proposals');
            let total = await collection.find(query).count();
            let proposals = await collection.find(query, { sort: { creationTime: -1 } })
                .project({ '_id': 0 })
                .limit(pageSize)
                .skip((pageNum - 1) * pageSize)
                .toArray();
            const totalActive = await this.getTotalActiveProposals();

            // For each proposal, build its stats
            const votesCollection = this.client.db().collection('votes');
            for (let proposal of proposals) {
                let proposalVotes = (await votesCollection.aggregate([
                    { "$match": { proposalId: proposal.id } },
                    { "$project": { proposalId: 1, voteFor: { $cond: [{ $eq: ["$vote", 'for'] }, 1, 0] }, voteAgainst: { $cond: [{ $eq: ["$vote", 'against'] }, 1, 0] } } },
                    { "$group": { "_id": "$proposalId", "votesFor": { "$sum": "$voteFor" }, "votesAgainst": { "$sum": "$voteAgainst" } } }
                ]).toArray())[0];

                if (!proposalVotes) {
                    // No vote yet
                    proposal["votesFor"] = 0;
                    proposal["votesAgainst"] = 0;
                }
                else {
                    proposal["votesFor"] = proposalVotes["votesFor"];
                    proposal["votesAgainst"] = proposalVotes["votesAgainst"];
                }

                // Check if user has already voted or not
                if (!userId) {
                    proposal["votedByUser"] = false;
                }
                else {
                    let userVote = await votesCollection.findOne({ voter: userId, proposalId: proposal.id });
                    proposal["votedByUser"] = userVote != null;
                    proposal["userVote"] = userVote?.['vote']
                }

                proposal["votingStatus"] = await this.getProposalVotingStatus(proposal)
            }

            logger.info("Proposals", proposals);

            return { code: 200, message: 'success', data: { total, result: proposals, totalActive } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }
    /*

        public async proposalsOpenForVotes(title: string, pageNum: number, pageSize: number) {
            let { start, end } = this.getValidVoteDate();

            let query: JSONObject = { status: 'approved', creationTime: { $gte: start.getTime() } };
            if (title) {
                query['title'] = title;
            }
            try {
                await this.client.connect();
                const collection = this.client.db().collection('proposals');
                let total = await collection.find(query).count();
                let result = await collection.find(query, { sort: { creationTime: -1 } }).project({ '_id': 0 })
                    .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
                return { code: 200, message: 'success', data: { total, result } };
            } catch (err) {
                logger.error(err);
                return { code: 500, message: 'server error' };
            } finally {
                await this.client.close();
            }
        } */

    private setTimeToZero(date: Date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
    }

    private getValidVoteDate() {
        let today = new Date(), start = new Date(), end = new Date();
        if (today.getDay() < 16) {
            start.setMonth(today.getMonth() - 1);
            start.setDate(16);
            end.setDate(16);
        } else {
            start.setDate(16);
            end.setMonth(today.getMonth() + 1);
            end.setDate(16);
        }
        this.setTimeToZero(start);
        this.setTimeToZero(end);
        return { start, end };
    }

    // TODO: creator is really string?
    /* public async userHaveVoted(creator: string) {
        try {
            await this.client.connect();
            const collection = this.client.db().collection('votes');
            let result = await collection.find({ creator }, { sort: { voteTime: -1 } }).project({ '_id': 0 }).toArray();
            let data: any[] = [];
            result.forEach((item) => {
                data.push(item.proposal);
            })
            return { code: 200, message: 'success', data };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    } */

    // TODO: voter is really string?
    public async voteForProposal(proposalId: string, voter: string, voteChoice: string) {
        try {

            // Make sure the proposal exists and is open for voting
            if (! await this.isProposalInVotingPeriod(proposalId)) {
                return { code: 403, message: 'Proposal not found, or currently not open for votes' };
            }
            if (!await this.isUserAllowedToVote(voter)) {
                return { code: 403, message: 'Invalid user, or user not approved yet' };
            }
            // Make sure the vote choice is valid
            if (voteChoice != 'for' && voteChoice != 'against') {
                return { code: 403, message: 'Invalid vote value' };
            }

            // Make sure user hasn't already voted for this proposal
            if (!await this.hasUserAlreadyVotedForProposal(voter, proposalId)) {
                const votesCollection = this.client.db().collection('votes');
                // Not voted yet, we can record the vote
                let vote: Vote = {
                    voter,
                    proposalId,
                    voteTime: Date.now(),
                    vote: voteChoice as VoteChoice
                }
                await votesCollection.insertOne(vote);
                return { code: 200, message: 'success' };
            } else {
                return { code: 403, message: 'Forbidden: already voted' };
            }
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }
    /**
     * Return the current voting period by default.
     * If the next param is set to true, will return the next voting period.
     * A voting period is between the 15th and the 21st (both included).
     * Both the start day and end day are inclusive
     * @example:
     * Start day = 15
     * End day = 21
     *
     * The voting period will start on the 15 at 00:00:00am and end the 21st at 23:59:59pm
     * todo: set voting period in the backend and configurable start/end days
     */
    public async getVotingPeriod(next: boolean = false): Promise<{ startDate: Date, endDate: Date, isTodayInVotingPeriod: boolean}> {
        try {

            const votingPeriodCollection = this.client.db().collection('votingperiod');
            let currentVotingPeriod = await votingPeriodCollection.findOne();
            if (!currentVotingPeriod) { // Insert a default voting period in case the config is not init yet
                const defaultVotingPeriod = { startDay: 20, endDay: 27 }
                await votingPeriodCollection.insertOne(defaultVotingPeriod);
                currentVotingPeriod = await votingPeriodCollection.findOne()
            }
            const startDay = currentVotingPeriod?.startDay as number;
            const endDay = currentVotingPeriod?.endDay as number;

            const now = moment().utc(false);

            let votingStartDate;
            // If we asked for the current voting period
            // And we are between the start day and the end day of the voting period.
            // We return the current period.
            if (!next && now.date() >= startDay && now.date() <= endDay) {
                votingStartDate = now.clone().set('date', startDay).startOf('day');
            } else {
                // We are outside of a vote period or we want to get the next voting period
                votingStartDate = now.clone()
                  .startOf("month")
                  .add(1, "month")
                  .set('date', startDay);
            }

            const votingEndDate = votingStartDate.clone().add((endDay - startDay), "days").endOf('day');

            const todayCheck = moment().utc(false).toDate();
            const isTodayInVotingPeriod = todayCheck.getTime() >= votingStartDate.toDate().getTime() && todayCheck.getTime() <= votingEndDate.toDate().getTime()

            return {
                startDate: votingStartDate.toDate(),
                endDate: votingEndDate.toDate(),
                isTodayInVotingPeriod: isTodayInVotingPeriod
            };
        } catch (e) {
            throw e;
        }
    }

    /**
     * Get the total count of active proposals
     * @private
     */
    private async getTotalActiveProposals(): Promise<number> {
        const collection = this.client.db().collection('proposals');
        const votingPeriod = await this.getVotingPeriod();
        const startVotingPeriod = dayjs(votingPeriod.startDate).startOf('day').toDate()
        const endVotingPeriod = dayjs(votingPeriod.endDate).endOf('day').toDate()
        return await collection.countDocuments({
            $and: [
                { status: 'approved' },
                { votingPeriodStartDate: { $gte: startVotingPeriod } },
                { votingPeriodEndDate: { $lte: endVotingPeriod } },
            ]
        })
    }

    /**
     * Cancel a vote
     * todo: remove this
     * @param proposalId The proposal ID to cancel the vote for
     * @param userId The user ID to cancel the vote for
     */
    async deleteVote(proposalId: any, userId: string) {
        try {
            if (!await this.isProposalInVotingPeriod(proposalId)) {
                return { code: 403, message: 'Proposal not found, or currently not open for votes' };
            }

            if (!await this.isUserAllowedToVote(userId)) {
                return { code: 403, message: 'Invalid user, or user not approved yet' };
            }

            if (!await this.hasUserAlreadyVotedForProposal(userId, proposalId)) {
                return { code: 403, message: 'User has not yet voted for this proposal' };
            }

            const votesCollection = this.client.db().collection('votes');
            try {
                await votesCollection.deleteOne({ voter: userId, proposalId: proposalId })
            } catch (ex) {
                return { code: 403, message: 'Something went wrong when tying to cancel the vote' };
            }

            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        }
    }

    /**
     * Return an human readable representation of the proposal voting period
     * @param proposal
     * @private
     */
    private async getProposalVotingStatus(proposal: any): Promise<string> {
        // Check if the proposal has not yet any start date or end date
        if (!proposal["votingPeriodStartDate"] || !proposal["votingPeriodEndDate"]) {
            return Promise.resolve("not_approved")
        }

        const proposalVotingStartDate = moment(proposal["votingPeriodStartDate"]).utc(false).toDate().getTime()
        const proposalVotingEndDate = moment(proposal["votingPeriodEndDate"]).utc(false).toDate().getTime()
        const now = moment().utc(false).toDate();
        const currentVotingPeriod = await this.getVotingPeriod();

        // If the current time is superior to the proposal voting start date, and inferior to the proposal voting period end date
        // We check that the voting period end date is inside the current voting period.
        if (now.getTime() >= proposalVotingStartDate && now.getTime() <= proposalVotingEndDate
          && proposalVotingEndDate >= currentVotingPeriod.startDate.getTime()
          && proposalVotingEndDate <= currentVotingPeriod.endDate.getTime()) {
            return Promise.resolve("active")
        } else if (now.getTime() > proposalVotingEndDate || proposalVotingEndDate < currentVotingPeriod.endDate.getTime()) { // Already ended
            return Promise.resolve("ended")
        } else if (now.getTime() < proposalVotingStartDate || proposalVotingStartDate > currentVotingPeriod.startDate.getTime()) { // not started
            return Promise.resolve("not_started")
        }

        return Promise.resolve("undefined")
    }

    /**
     * Given a proposal ID, this function will return true if the proposal is currently in a voting period
     * (meaning today is between the proposal start voting date and end voting date), false otherwise.
     * Make sure that the mongo connection is initialize before calling this function.
     * @param proposalId
     * @private
     */
    private async isProposalInVotingPeriod(proposalId: string) {
        const collectionProposal = this.client.db().collection('proposals');
        const now = moment().utc(false).toDate();
        const result = await collectionProposal.countDocuments({ $and: [
                { id: proposalId },
                { votingPeriodStartDate: { $lte: now } },
                { votingPeriodEndDate: { $gte: now } },
            ]}, {limit: 1});
        return result > 0
    }

    /**
     * Return true if the user is allowed to vote
     * @param userId
     * @private
     */
    private async isUserAllowedToVote(userId: string): Promise<boolean> {
        // Make sure user is allowed to vote
        const usersCollection = this.client.db().collection<User>('users');
        const isUserAllowedToVote = await usersCollection.countDocuments({
            did: userId,
            active: true
        }, {limit: 1});
        return isUserAllowedToVote > 0;
    }

    /**
     * Return true if the user has already voted for the given proposal
     * @param userId
     * @param proposalId
     * @private
     */
    private async hasUserAlreadyVotedForProposal(userId: string, proposalId: string): Promise<boolean> {
        const votesCollection = this.client.db().collection('votes');
        const hasAlreadyVoted = await votesCollection.countDocuments({
            voter: userId,
            proposalId: proposalId
        }, {limit: 1});
        return hasAlreadyVoted > 0
    }

    async setVotingPeriod(startDay: number, endDay: number): Promise<void> {
        try {
            const votingPeriodCollection = this.client.db().collection('votingperiod');
            let currentVotingPeriod = await votingPeriodCollection.findOne();
            let votingPeriod = {
                startDay: startDay,
                endDay: endDay
            }
            if (!currentVotingPeriod) {
                await votingPeriodCollection.insertOne(votingPeriod);
            } else {
                await votingPeriodCollection.updateOne({}, {
                      $set: {
                          "startDay": votingPeriod.startDay,
                          "endDay": votingPeriod.endDay
                      }},
                  { upsert: true }
                );
            }
            return Promise.resolve();
        } catch (e) {
            console.error(e);
            return Promise.reject(e);
        }
    }

    async patchProposal(proposalId: string, proposal: {votingPeriodStartDate: string, votingPeriodEndDate: string}) {
        try {
            const collection = this.client.db().collection('proposals');

            const result = await collection.updateOne({ id: proposalId },
              { $set: {
                      votingPeriodStartDate: moment(proposal.votingPeriodStartDate).utc(false).toDate(),
                      votingPeriodEndDate: moment(proposal.votingPeriodEndDate).utc(false).toDate()
                  } });
            if (result.matchedCount === 1) {
                return 200;
            } else {
                return 404;
            }
        } catch (err) {
            logger.error(err);
            return 500;
        }
    }

    /**
     * Patch user
     * For now only update the status
     * @param userDid User ID
     * @param status user status
     */
    async patchUser(userDid: string, status: string): Promise<number> {
        try {
            const collection = this.client.db().collection('users');
            let updateStatus = {}
            if (status === "inactive") {
                updateStatus = {
                    active: false,
                    kycIdentityHash: null
                }
            } else if (status === "active") {
                updateStatus = {
                    active: true
                }
            } else {
                throw new Error("invalid status")
            }
            await collection.updateOne({ did: userDid }, {
                $set: updateStatus
            });
            return Promise.resolve(200)
        } catch (err) {
            logger.error(err);
            return err
        }
    }
}

export const dbService = new DBService();
