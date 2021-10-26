import mongodb from "mongodb";
import { Config } from "../config";
import logger from "../logger";

class DBService {
    public async updateUser(did, name, email): Promise<number> {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            const collection = client.db().collection('users');
            let result = await collection.updateOne({ did }, { $set: { name, email } });
            return result.matchedCount;
        } catch (err) {
            logger.error(err);
        } finally {
            await client.close();
        }
    }

    public async findUserByDID(did) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            const collection = client.db().collection('users');
            return await collection.find({ did }).project({ '_id': 0 }).limit(1).toArray();
        } catch (err) {
            logger.error(err);
        } finally {
            await client.close();
        }
    }

    public async activateUser(did, code) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            const collection = client.db().collection('users');
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
            await client.close();
        }
    }

    public async addUser(user) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            const collection = client.db().collection('users');
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
            await client.close();
        }
    }

    public async removeUser(did) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            const collection = client.db().collection('users');
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
            await client.close();
        }
    }

    public async listUser(key, pageNum, pageSize) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });

        let query = { type: 'user' };
        if (key) {
            Object.assign(query, { $or: [{ did: key }, { name: { $regex: key } }, { tgName: { $regex: key } }] })
        }

        try {
            await client.connect();
            const collection = client.db().collection('users');
            let total = await collection.find(query).count();
            let result = await collection.find(query).sort({ createTime: -1 }).project({ "_id": 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await client.close();
        }
    }

    public async auditProposal(id, status, operator) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            const collection = client.db().collection('proposals');
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
            await client.close();
        }
    }

    public async addProposal(proposal) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            const collection = client.db().collection('proposals');
            await collection.insertOne(proposal);
            return { code: 200, message: 'success' };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await client.close();
        }
    }

    public async listUsersProposal(creator, pageNum, pageSize) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            const collection = client.db().collection('proposals');
            let total = await collection.find({ creator }).count();
            let result = await collection.find({ creator }, { sort: { createTime: -1 } }).project({ '_id': 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await client.close();
        }
    }

    public async listAllProposal(title, pageNum, pageSize) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        let query = {};
        if (title) {
            query['title'] = title;
        }
        try {
            await client.connect();
            const collection = client.db().collection('proposals');
            let total = await collection.find(query).count();
            let result = await collection.find(query, { sort: { createTime: -1 } }).project({ '_id': 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await client.close();
        }
    }

    private async setTimeToZero(date: Date) {
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
    }

    private async getValidVoteDate() {
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
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });

        let { start, end } = await this.getValidVoteDate();

        let query = { status: 'approved', $gte: { createTime: start.getTime() }, $lt: { createTime: end.getTime() } };
        if (title) {
            query['title'] = title;
        }
        try {
            await client.connect();
            const collection = client.db().collection('proposals');
            let total = await collection.find(query).count();
            let result = await collection.find(query, { sort: { createTime: -1 } }).project({ '_id': 0 })
                .limit(pageSize).skip((pageNum - 1) * pageSize).toArray();
            return { code: 200, message: 'success', data: { total, result } };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await client.close();
        }
    }

    public async userHaveVoted(creator) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        try {
            await client.connect();
            const collection = client.db().collection('votes');
            let result = await collection.find({ creator }, { sort: { voteTime: -1 } }).project({ '_id': 0 }).toArray();
            return { code: 200, message: 'success', data: result };
        } catch (err) {
            logger.error(err);
            return { code: 500, message: 'server error' };
        } finally {
            await client.close();
        }
    }

    public async vote(proposal, voter) {
        let client = new mongodb.MongoClient(Config.mongodb, { useNewUrlParser: true, useUnifiedTopology: true });
        let { start, end } = await this.getValidVoteDate();

        try {
            await client.connect();

            const collectionProposal = client.db().collection('proposals');
            const result = await collectionProposal.find({
                id: proposal, $gte: { createTime: start.getTime() },
                $lt: { createTime: end.getTime() }
            }).limit(1).toArray();
            if (result.length === 0) {
                return { code: 403, message: 'forbidden' };
            }

            const collection = client.db().collection('votes');
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
            await client.close();
        }
    }
}

export const dbService = new DBService();