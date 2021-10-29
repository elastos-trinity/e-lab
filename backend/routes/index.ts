import { VerifiablePresentation } from '@elastosfoundation/did-js-sdk';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v1 as uuidV1 } from 'uuid';
import { SecretConfig } from '../config/env-secret';
import logger from '../logger';
import { Proposal } from '../model/proposal';
import { ProposalStatus } from '../model/proposalstatus';
import { User } from '../model/user';
import { dbService } from '../services/db.service';

let router = Router();

/* Used for service check. */
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/check', async (req, res) => {
    res.json(await dbService.checkConnect());
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/login', async (req, res) => {
    let presentationStr = req.body;
    let vp = VerifiablePresentation.parse(presentationStr);
    let valid = await vp.isValid();
    if (!valid) {
        res.json({ code: 403, message: 'Invalid presentation' });
        return;
    }

    let did = vp.getHolder().toString();
    if (!did) {
        res.json({ code: 400, message: 'Unable to extract owner DID from the presentation' })
        return;
    }

    // First check if we know this user yet or not. If not, we will create an entry
    let existingUser = await dbService.findUserByDID(did);
    let user: User;
    if (existingUser) {
        // Nothing to do yet
        logger.info("Existing user is signing in", existingUser);
        user = existingUser;
    }
    else {
        logger.info("Unknown user is signing in with DID", did, ". Creating a new user");

        // Optional name
        let nameCredential = vp.getCredential(`name`);
        let name = nameCredential ? nameCredential.getSubject().getProperty('name') : '';

        // Optional email
        let emailCredential = vp.getCredential(`email`);
        let email = emailCredential ? emailCredential.getSubject().getProperty('email') : '';

        user = {
            did,
            type: 'user',
            name,
            email
        };
        let result = await dbService.addUser(user);
        if (result.code != 200) {
            res.json(result);
            return;
        }

        /* let matchedCount = await dbService.updateUser(did, name, email);
        if (matchedCount !== 1) {
            res.json({ code: 400, message: 'User does not exist' })
            return;
        } */
    }

    let token = jwt.sign(user, SecretConfig.Auth.jwtSecret, { expiresIn: 60 * 60 * 24 * 7 });
    res.json({ code: 200, message: 'success', data: token });
})

router.get('/currentUser', (req, res) => {
    res.json({ code: 200, message: 'success', data: req.user })
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
/* router.post('/user/add', async (req, res) => {
    if (req.user.type !== 'admin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    let { tgName, did } = req.body;
    if (!tgName || !did) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }

    res.json(await dbService.addUser({
        tgName, did, type: 'user',
        active: false, creationTime: Date.now()
    }));
}) */

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/user/remove/:did', async (req, res) => {
    if (req.user.type !== 'admin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    let did = req.params.did;
    if (!did) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }
    res.json(await dbService.removeUser(did));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/user/setTelegramUserId', async (req, res) => {
    if (req.user.type !== 'admin') {
        res.json({ code: 403, message: 'Admin only' });
        return;
    }

    let { did, telegramUserId } = req.body;
    if (!did || !telegramUserId) {
        res.json({ code: 400, message: 'Missing DID or telegramUserId' });
        return;
    }
    res.json({
        code: 200,
        message: 'success',
        data: await dbService.setTelegramUserId(did, telegramUserId)
    });
})

/**
 * Attempt to verify the telegram verification code from the user.
 */
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/user/setTelegramVerificationCode', async (req, res) => {
    let code = req.query.code as string;
    let did = req.user.did as string;

    res.json(await dbService.setTelegramVerificationCode(did, code));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/users/list', async (req, res) => {
    let pageNumStr = req.query.pageNum as string;
    let pageSizeStr = req.query.pageSize as string;
    let filter = req.query.filter as string;

    try {
        let pageNum: number = pageNumStr ? parseInt(pageNumStr) : 1;
        let pageSize: number = pageSizeStr ? parseInt(pageSizeStr) : 10;

        if (pageNum < 1 || pageSize < 1) {
            res.json({ code: 400, message: 'Invalid page number or page size' })
            return;
        }

        res.json(await dbService.listUsers(filter, pageNum, pageSize));
    } catch (e) {
        console.log(e);
        res.json({ code: 400, message: 'bad request' });
        return;
    }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/proposal/audit/:id', async (req, res) => {
    if (req.user.type !== 'admin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    let proposalId = req.params.id as string;
    let result = req.query.result as ProposalStatus;
    if (!proposalId || !result) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }

    let status: ProposalStatus = result === "rejected" ? ProposalStatus.REJECTED : ProposalStatus.APPROVED;
    let operator = req.user.did;

    res.json(await dbService.auditProposal(proposalId, status, operator));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/proposal/add', async (req, res) => {
    if (!req.user.active) {
        res.json({ code: 403, message: 'User is not yet active.' });
        return;
    }

    let { title, link } = req.body;
    if (!title || !link) {
        res.json({ code: 400, message: 'Missing title or link' });
        return;
    }

    let proposal: Proposal = {
        id: uuidV1(),
        title,
        link,
        creator: req.user.did,
        creationTime: Date.now(),
        status: 'new'
    };
    res.json(await dbService.addProposal(proposal));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/proposals/mine', async (req, res) => {
    let pageNumStr = req.query.pageNum as string;
    let pageSizeStr = req.query.pageSize as string;
    let userId: string = req.user.did;

    let pageNum: number, pageSize: number;

    try {
        pageNum = pageNumStr ? parseInt(pageNumStr) : 1;
        pageSize = pageSizeStr ? parseInt(pageSizeStr) : 10;

        if (pageNum < 1 || pageSize < 1) {
            res.json({ code: 400, message: 'bad request' })
            return;
        }
    } catch (e) {
        console.log(e);
        res.json({ code: 400, message: 'bad request' });
        return;
    }

    res.json(await dbService.listUsersProposal(userId, pageNum, pageSize));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/proposals/all', async (req, res) => {
    let pageNumStr = req.query.pageNum as string;
    let pageSizeStr = req.query.pageSize as string;
    let title = req.query.title as string;
    let userId: string = req.user.did;

    try {
        let pageNum = pageNumStr ? parseInt(pageNumStr) : 1;
        let pageSize = pageSizeStr ? parseInt(pageSizeStr) : 10;

        if (pageNum < 1 || pageSize < 1) {
            res.json({ code: 400, message: 'bad request' })
            return;
        }

        res.json(await dbService.listProposals(title, false, userId, pageNum, pageSize));

    } catch (e) {
        console.log(e);
        res.json({ code: 400, message: 'bad request' });
        return;
    }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/proposals/active', async (req, res) => {
    let pageNumStr = req.query.pageNum as string;
    let pageSizeStr = req.query.pageSize as string;
    let title = req.query.title as string;
    let userId: string = req.user.did;

    try {
        let pageNum: number = pageNumStr ? parseInt(pageNumStr) : 1;
        let pageSize: number = pageSizeStr ? parseInt(pageSizeStr) : 10;

        if (pageNum < 1 || pageSize < 1) {
            res.json({ code: 400, message: 'bad request' })
            return;
        }

        res.json(await dbService.listProposals(title, true, userId, pageNum, pageSize));

    } catch (e) {
        console.log(e);
        res.json({ code: 400, message: 'bad request' });
        return;
    }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/proposal/:id/vote', async (req, res) => {
    let id = req.params.id;
    let voteChoice = req.query.vote as string;
    let userId = req.user.did;

    if (!id || !voteChoice) {
        res.json({ code: 400, message: 'Missing proposal id or vote choice' });
        return;
    }

    res.json(await dbService.voteForProposal(id, userId, voteChoice));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
/* router.get('/proposal/userHaveVoted', async (req, res) => {
    let userId = req.user.did;
    res.json(await dbService.userHaveVoted(userId));
}) */

export default router;
