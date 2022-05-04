import { VerifiablePresentation } from '@elastosfoundation/did-js-sdk';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v1 as uuidV1 } from 'uuid';
import { SecretConfig } from '../config/env-secret';
import CrSuggestionResponseDto from "../dtos/crSuggestionResponse.dto";
import logger from '../logger';
import { Proposal } from '../model/proposal';
import { ProposalGrant } from '../model/proposalgrant';
import { ProposalStatus } from '../model/proposalstatus';
import { User } from '../model/user';
import { crService } from '../services/cr.service';
import { credentialsService } from '../services/credentials.service';
import { dbService } from '../services/db.service';
import { apiError } from '../utils/api';

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
            email,
            canManageAdmins: false
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
    if (req.user.type !== 'superadmin') {
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
router.post('/user/setTelegramUserInfo', async (req, res) => {
    if (req.user.type !== 'admin' && req.user.type !== 'superadmin') {
        res.json({ code: 403, message: 'Admin only' });
        return;
    }

    let { did, telegramUserName, telegramUserId } = req.body;
    if (!did || !telegramUserName || !telegramUserId) {
        res.json({ code: 400, message: 'Missing DID or telegramUserName or telegramUserId' });
        return;
    }
    res.json(await dbService.setTelegramUserInfo(did, telegramUserName, telegramUserId));
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

/**
 * Attempt to verify the telegram verification code from the user.
 */
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.patch('/user/:did', async (req, res) => {
    let status = req.body.status as string;
    let discordId = req.body.discordId as string;
    let userDid = req.params.did as string;

    try {
        if (status && status.length > 0) {
            return res.status(await dbService.patchUserStatus(userDid, status)).json({});
        } else if (discordId && discordId.length > 0) {
            return res.status(await dbService.patchDiscordId(userDid, discordId)).json({});
        }
    } catch (e) {
        return res.sendStatus(500);
    }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/user/setUserType', async (req, res) => {
    if (req.user.type !== 'admin' && req.user.type !== 'superadmin') {
        res.json({ code: 403, message: 'Admin only' });
        return;
    }

    let {
        targetDid,  // User whose admin right will change
        type // new user type (user, admin)
    } = req.body;
    if (!targetDid || !type) {
        res.json({ code: 400, message: 'Missing targetDid or canManageAdmins' });
        return;
    }
    res.json({
        code: 200,
        message: 'success',
        data: await dbService.setUserType(targetDid, type)
    });
})

/**
 * Attempt to activate the user from his KYC-ed information.
 */
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/user/kycactivation', async (req, res) => {
    let did = req.user.did as string;

    let user = await dbService.findUserByDID(did);
    if (!user) {
        return res.json({ code: 401, message: "Inexisting user" });
    }

    // Forbid user to activate himself again, possibly with another identity somehow,
    // if he is already active
    if (user.active) {
        return res.json({ code: 400, message: "User already activated, cannot activate by KYC again" });
    }

    let presentation = req.body;
    let vp;
    let response;
    try {
        if (typeof presentation === "string")
            console.log("pres from str", presentation)
        else {
            try {
                console.log("pres from object", JSON.stringify(presentation))
            } catch (e) {
                console.warn("pres is not a string, but can't be stringified", presentation);
            }
        }

        vp = VerifiablePresentation.parse(presentation)
        response = await credentialsService.prepareKycActivationFromPresentation(did, vp);

        if (response.error) {
            return apiError(res, response);
        }
    } catch (parseError) {
        console.error(parseError);
        return res.json({ code: 500, message: 'error while parsing presentation' });
    }

    return res.json({ code: 200, message: 'success' });
});

/**
 * Bind a new wallet address to the user.
 */
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/user/wallet', async (req, res) => {
    let did = req.user.did as string;

    let user = await dbService.findUserByDID(did);
    if (!user) {
        return res.json({ code: 401, message: "Inexisting user" });
    }

    let walletAddress = req.body.walletAddress;
    if (!walletAddress) {
        return res.json({ code: 401, message: "walletAddress is missing" });
    }

    res.json({
        code: 200,
        message: 'success',
        data: await dbService.addUserWallet(did, walletAddress)
    });
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/users/list', async (req, res) => {
    if (req.user.type !== 'superadmin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    let pageNumStr = req.query.pageNum as string;
    let pageSizeStr = req.query.pageSize as string;
    let search = req.query.search as string;

    try {
        let pageNum: number = pageNumStr ? parseInt(pageNumStr) : 1;
        let pageSize: number = pageSizeStr ? parseInt(pageSizeStr) : 10000; //todo: refactor this to set appropriate

        if (pageNum < 1 || pageSize < 1) {
            res.json({ code: 400, message: 'Invalid page number or page size' })
            return;
        }

        res.json(await dbService.listUsers(search, pageNum, pageSize));
    } catch (e) {
        console.error(e);
        res.json({ code: 400, message: 'bad request' });
        return;
    }
})


// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.patch('/proposals/:id', async (req, res) => {
    if (req.user.type !== 'superadmin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    let proposalId = req.params.id as string;
    let proposal = req.body;

    if (!proposalId || !proposal) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }

    res.sendStatus(await dbService.patchProposal(proposalId, proposal));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.put('/proposal/:id/audit', async (req, res) => {
    if (req.user.type !== 'admin' && req.user.type !== 'superadmin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    if (req.body.now && req.user.type !== 'superadmin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    const setForCurrentVotingPeriod = req.body.now;

    const proposalId = req.params.id as string;
    const status = req.body.result as ProposalStatus;

    if (!proposalId || !status) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }

    let operator = req.user.did;

    const isSuperAdmin: boolean = req.user.type === 'superadmin';
    res.json(await dbService.auditProposal(proposalId, status, operator, setForCurrentVotingPeriod, isSuperAdmin));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/proposal/:id/grant', async (req, res) => {
    if (req.user.type !== 'admin' && req.user.type !== 'superadmin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    let proposalId = req.params.id as string;
    let grantStatus = req.body.grantStatus as ProposalGrant;
    if (!proposalId || !grantStatus) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }

    let operator = req.user.did;

    res.json(await dbService.grantProposal(proposalId, grantStatus, operator));
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/proposals', async (req, res) => {
    if (!req.user.active) {
        res.status(403)
        res.json({ code: 403, message: 'User is not yet active.' });
        return;
    }

    let { title, link, description } = req.body;
    if (!title || !link || !description) {
        res.status(400)
        res.json({ code: 400, message: 'Missing title, description or link' });
        return;
    }

    let budget: number;
    try {
        const crResponse = await crService.getSuggestion(link) as string;
        const suggestion = JSON.parse(crResponse) as CrSuggestionResponseDto
        budget = Number.parseFloat(suggestion.data.budgetAmount ? suggestion.data.budgetAmount : "0");
        if (!budget || budget === 0) {
            res.status(400)
            res.json({ code: 400, message: 'The suggestion has no budget' });
        }

        console.log(suggestion);
    } catch (e) {
        res.status(400)
        console.log(e);
        res.json({ code: 400, message: 'Can not find the suggestion' });
        return;
    }

    let proposal: Proposal = {
        id: uuidV1(),
        title,
        budget,
        link,
        description,
        creator: req.user.did,
        creationTime: Date.now(),
        status: 'new',
        grant: 'undecided'
    };
    res.json(await dbService.addProposal(proposal));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/voting-period', async (req, res) => {
    try {
        const votingPeriod = await dbService.getVotingPeriod()
        return res.status(200).json(votingPeriod);
    } catch (ex) {
        console.error(`Error while trying to get current voting period: ${ex}`)
        return res.status(500)
    }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.put('/voting-period', async (req, res) => {
    if (req.user.type !== 'superadmin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }
    try {
        if (!req.body.startDay || !req.body.endDay) {
            console.error('Error while trying to update the voting period starDay or endDay null')
            return res.status(500)
        }
        const votingPeriod = await dbService.setVotingPeriod(req.body.startDay, req.body.endDay)
        return res.status(200).json(votingPeriod);
    } catch (ex) {
        console.error(`Error while trying to get current voting period: ${ex}`)
        return res.status(500)
    }
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
        console.error(e);
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
        console.error(e);
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
        console.error(e);
        res.json({ code: 400, message: 'bad request' });
        return;
    }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/proposal/:id/vote', async (req, res) => {
    let id = req.params.id;
    let voteChoice = req.body.vote as string;
    let userId = req.user.did;

    if (!id || !voteChoice) {
        res.json({ code: 400, message: 'Missing proposal id or vote choice' });
        return;
    }

    res.json(await dbService.voteForProposal(id, userId, voteChoice));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/proposals/:id', async (req, res) => {
    try {
        res.json(await dbService.findProposalById(req.params.id));
    } catch (e) {
        console.error(e);
        res.json({ code: 400, message: 'bad request' });
        return;
    }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
/* router.get('/proposal/userHaveVoted', async (req, res) => {
    let userId = req.user.did;
    res.json(await dbService.userHaveVoted(userId));
}) */

export default router;
