import { MongoClient } from "mongodb";
import { Config } from "../config";
import logger from "../logger";
import { Proposal } from "../model/proposal";
import { ProposalStatus } from "../model/proposalstatus";
import { User } from "../model/user";

class DBService {
    private client: MongoClient;

    constructor() {
        this.client = new MongoClient(Config.mongodb, {
            //useNewUrlParser: true, useUnifiedTopology: true
        });
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

    public async findUserByDID(did: string): Promise<User | null> {
        try {
            await this.client.connect();
            const collection = this.client.db().collection<User>('users');
            return (await collection.find({ did }).project<User>({ '_id': 0 }).limit(1).toArray())[1];
        } catch (err) {
            logger.error(err);
            return null;
        } finally {
            await this.client.close();
        }
    }

    public async activateUser(did: string, code: string) {
        try {
            await this.client.connect();
            const collection = this.client.db().collection('users');
            let result = await collection.updateOne({ did, code }, { $set: { active: true } });
            if (result.matchedCount === 1) {
                return { code: 200, message: 'success' };
            } else {
                return { code: 400, message: 'user not exists or code error' }
            }
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    public async addUser(user: User) {
        try {
            await this.client.connect();
            const collection = this.client.db().collection('users');
            const docs = await collection.find({ $or: [{ did: user.did }, { tgName: user.tgName }] }).toArray();
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

    public async listUser(key: string, pageNum: number, pageSize: number) {
        let query = { type: 'user' };
        if (key) {
            Object.assign(query, { $or: [{ did: key }, { name: { $regex: key } }, { tgName: { $regex: key } }] })
        }

        try {
            await this.client.connect();
            const collection = this.client.db().collection('users');
            let total = await collection.find(query).count();
            let result = await collection.find(query).sort({ createTime: -1 }).project({ "_id": 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    // TODO: operator is really string ?
    public async auditProposal(id: string, status: ProposalStatus, operator: string) {
        try {
            await this.client.connect();
            const collection = this.client.db().collection('proposals');
            let result = await collection.updateOne({ id, status: 'new' },
                { $set: { status, operator, operateTime: Date.now() } });
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
            let result = await collection.find({ creator }, { sort: { createTime: -1 } }).project({ '_id': 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    public async listAllProposal(title: string, pageNum: number, pageSize: number) {
        let query: {
            title?: string
        } = {};

        if (title) {
            query['title'] = title;
        }
        try {
            await this.client.connect();
            const collection = this.client.db().collection('proposals');
            let total = await collection.find(query).count();
            let result = await collection.find(query, { sort: { createTime: -1 } }).project({ '_id': 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

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

    public async listCanVoteProposal(title: string, pageNum: number, pageSize: number) {
        let { start, end } = await this.getValidVoteDate();

        let query = { title: '', status: 'approved', $gte: { createTime: start.getTime() }, $lt: { createTime: end.getTime() } };
        if (title) {
            query['title'] = title;
        }
        try {
            await this.client.connect();
            const collection = this.client.db().collection('proposals');
            let total = await collection.find(query).count();
            let result = await collection.find(query, { sort: { createTime: -1 } }).project({ '_id': 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    // TODO: creator is really string?
    public async userHaveVoted(creator: string) {
        try {
            await this.client.connect();
            const collection = this.client.db().collection('votes');
            let result = await collection.find({ creator }, { sort: { voteTime: -1 } }).project({ '_id': 0 }).toArray();
            return { code: 200, message: 'success', data: result };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await this.client.close();
        }
    }

    // TODO: voter is really string?
    public async vote(proposal: Proposal, voter: string) {
        let { start, end } = await this.getValidVoteDate();

        try {
            await this.client.connect();

            const collectionProposal = this.client.db().collection('proposals');
            const result = await collectionProposal.find({
                id: proposal, $gte: { createTime: start.getTime() },
                $lt: { createTime: end.getTime() }
            }).limit(1).toArray();
            if (result.length === 0) {
                return { code: 403, message: 'forbidden' };
            }

            const collection = this.client.db().collection('votes');
            const docs = await collection.find({ voter, proposal }).limit(1).toArray();
            if (docs.length === 0) {
                await collection.insertOne({ voter, proposal, voteTime: Date.now() });
                return { code: 200, message: 'success' };
            } else {
                return { code: 403, message: 'forbidden' };
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