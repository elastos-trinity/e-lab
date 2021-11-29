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

class DBService {
    private client: MongoClient;

    constructor() {
        let mongoConnectionUrl;
        if (SecretConfig.Mongo.user)
            mongoConnectionUrl = `mongodb://${SecretConfig.Mongo.user}:${SecretConfig.Mongo.password}@${SecretConfig.Mongo.host}:${SecretConfig.Mongo.port}/${SecretConfig.Mongo.dbName}?authSource=admin`;
        else
            mongoConnectionUrl = `mongodb://${SecretConfig.Mongo.host}:${SecretConfig.Mongo.port}/${SecretConfig.Mongo.dbName}`;

        console.log("mongoConnectionUrl", mongoConnectionUrl);

        this.client = new MongoClient(mongoConnectionUrl, {
            //useNewUrlParser: true, useUnifiedTopology: true
        });
    }

    public async checkConnect(): Promise<CommonResponse<void>> {
        try {
            await this.client.connect();
            await this.client.db().collection('users').find({}).limit(1);
            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 200, message: 'mongodb connect failed' };
        } finally {
            await this.client.close();
        }
    }

    public async updateUser(did: string, name: string, email: string): Promise<number> {
        try {
            await this.client.connect();
            const collection = this.client.db().collection('users');
            let result = await collection.updateOne({ did }, { $set: { name, email } });
            return result.matchedCount;
        } catch (err) {
            logger.error(err);
            return -1;
        } finally {
            await this.client.close();
        }
    }

    /**
     * Updates telegram user name and ID and returns an activation code.
     * When the telegram UID is changed, the user becomes not active until he confirms
     * the code (in case the uid is changed after the user was confirmed one).
     */
    public async setTelegramUserInfo(did: string, telegramUserName: string, telegramUserId: string): Promise<CommonResponse<string | null>> {
        try {
            await this.client.connect();
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
        } finally {
            await this.client.close();
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
        } finally {
            await this.client.close();
        }
    }

    public async setUserType(targetDid: string, type: UserType) {
        try {
            await this.client.connect();
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
        } finally {
            await this.client.close();
        }
    }

    public async activateUserFromKYC(targetDid: string, kycIdentityHash: string) {
        console.log(`Activating user ${targetDid} with identity hash ${kycIdentityHash}`);

        try {
            await this.client.connect();
            const collection = this.client.db().collection('users');

            await collection.updateOne({ did: targetDid }, { $set: { kycIdentityHash, active: true } });

            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    public async findUserByDID(did: string): Promise<User | null> {
        try {
            await this.client.connect();
            const collection = this.client.db().collection<User>('users');
            return (await collection.find({ did }).project<User>({ '_id': 0 }).limit(1).toArray())[0];
        } catch (err) {
            logger.error(err);
            return null;
        } finally {
            await this.client.close();
        }
    }

    public async findUserByKYCIdentityHash(kycIdentityHash: string): Promise<User | null> {
        try {
            await this.client.connect();
            const collection = this.client.db().collection<User>('users');
            let user = await collection.findOne({ kycIdentityHash }) || null;
            return user;
        } catch (err) {
            logger.error(err);
            return null;
        } finally {
            await this.client.close();
        }
    }

    public async addUser(user: User): Promise<CommonResponse<void>> {
        try {
            await this.client.connect();
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
        } finally {
            await this.client.close();
        }
    }

    public async removeUser(did: string) {
        try {
            await this.client.connect();
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
        } finally {
            await this.client.close();
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
            await this.client.connect();
            const collection = this.client.db().collection('users');
            let total = await collection.find(query).count();
            logger.info("Getting list of users with query", query);
            let result = await collection.find(query).sort({ creationTime: -1 }).project({ "_id": 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    public async addUserWallet(targetDid: string, walletAddress: string) {
        console.log(`Binding wallet address ${walletAddress} to user ${targetDid}`);

        try {
            await this.client.connect();
            const collection = this.client.db().collection('users');

            await collection.updateOne({ did: targetDid }, { $push: { wallets: walletAddress } });

            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    public async auditProposal(id: string, status: ProposalStatus, operator: string) {
        try {
            await this.client.connect();
            const collection = this.client.db().collection('proposals');
            let result = await collection.updateOne({ id, status: 'new' },
                { $set: { status, operator, operatedTime: Date.now() } });
            if (result.matchedCount === 1) {
                return { code: 200, message: 'success' };
            } else {
                return { code: 400, message: 'proposal not exists or not in proper status' }
            }
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    public async grantProposal(id: string, grant: ProposalGrant, operator: string) {
        try {
            await this.client.connect();
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
        } finally {
            await this.client.close();
        }
    }

    public async addProposal(proposal: Proposal) {
        try {
            await this.client.connect();
            const collection = this.client.db().collection('proposals');
            await collection.insertOne(proposal);
            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    // TODO: creator is really string?
    public async listUsersProposal(creator: string, pageNum: number, pageSize: number) {
        try {
            await this.client.connect();
            const collection = this.client.db().collection('proposals');
            let total = await collection.find({ creator }).count();
            let result = await collection.find({ creator }, { sort: { creationTime: -1 } }).project({ '_id': 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    public async listProposals(title: string, activeOnly: boolean, userId: string, pageNum: number, pageSize: number) {
        let query: JSONObject;
        if (activeOnly)
            query = { status: 'approved' };
        else
            query = {}; // all

        if (title)
            query['title'] = title;

        try {
            await this.client.connect();
            const collection = this.client.db().collection('proposals');
            let total = await collection.find(query).count();
            let proposals = await collection.find(query, { sort: { creationTime: -1 } })
                .project({ '_id': 0 })
                .limit(pageSize)
                .skip((pageNum - 1) * pageSize)
                .toArray();

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
                    let userVoteCount = await votesCollection.count({ voter: userId, proposalId: proposal.id });
                    proposal["votedByUser"] = userVoteCount > 0 ? true : false;
                }
            }

            logger.info("Proposals", proposals);

            return { code: 200, message: 'success', data: { total, result: proposals } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
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
        let { start, end } = this.getValidVoteDate();

        try {
            await this.client.connect();

            // Make sure the proposal exists and is open for voting
            const collectionProposal = this.client.db().collection('proposals');
            const result = await collectionProposal.find({ id: proposalId, creationTime: { $gte: start.getTime() } }).limit(1).toArray();
            if (result.length === 0) {
                return { code: 403, message: 'Proposal not found, or currently not open for votes' };
            }

            // Make sure user is allowed to vote
            const usersCollection = this.client.db().collection<User>('users');
            let user = await usersCollection.findOne({
                did: voter
            });
            if (!user || !user.active) {
                return { code: 403, message: 'Invalid user, or user not approved yet' };
            }

            // Make sure the vote choice is valid
            if (voteChoice != 'for' && voteChoice != 'against') {
                return { code: 403, message: 'Invalid vote value' };
            }

            // Make sure user hasn't already voted for this proposal
            const votesCollection = this.client.db().collection('votes');
            const docs = await votesCollection.find({ voter, proposalId }).limit(1).toArray();
            if (docs.length === 0) {
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
        } finally {
            await this.client.close();
        }
    }
}

export const dbService = new DBService();
