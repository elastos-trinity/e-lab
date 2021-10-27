import { VerifiablePresentation } from '@elastosfoundation/did-js-sdk';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v1 as uuidV1 } from 'uuid';
import { Config } from '../config';
import { ProposalStatus } from '../model/proposalstatus';
import { dbService } from '../services/db.service';

let router = Router();

/* Used for service check. */
router.get('/check', async (req, res) => {
    res.json(await dbService.checkConnect());
});

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/login', async (req, res) => {
    let presentationStr = req.body;
    let vp = VerifiablePresentation.parse(presentationStr);
    let valid = await vp.isValid();
    if (!valid) {
        res.json({ code: 403, message: 'Credential verified failed' });
        return;
    }

    let did = vp.getHolder().getMethodSpecificId();
    if (!did) {
        res.json({ code: 400, message: 'User did not exists' })
        return;
    }

    let name = vp.getCredential(`name`).getSubject().getProperty('name');
    let email = vp.getCredential(`email`).getSubject().getProperty('email');
    let matchedCount = await dbService.updateUser(did, name, email);
    if (matchedCount !== 1) {
        res.json({ code: 400, message: 'User did not exists' })
        return;
    }

    let token = jwt.sign({ did }, Config.jwtSecret, { expiresIn: 60 * 60 * 24 * 7 });
    res.json({ code: 200, message: 'success', data: token });
})

router.get('/currentUser', (req, res) => {
    res.json({ code: 200, message: 'success', data: req.user })
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/active', async (req, res) => {
    let code = req.query.code as string;
    let did = req.user.did as string;

    res.json(await dbService.activateUser(did, code));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/user/add', async (req, res) => {
    if (req.user.type !== 'admin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    let { tgName, did } = req.body;
    if (!tgName || !did) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }

    let code = (Math.random() * 10000 + '').slice(0, 4);
    res.json(await dbService.addUser({
        key: '',
        id: uuidV1(), tgName, did, type: 'user', code,
        activate: false, createTime: Date.now()
    }));
})

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
router.get('/user/list', async (req, res) => {
    let pageNumStr = req.query.pageNum as string;
    let pageSizeStr = req.query.pageSize as string;
    let key = req.user.key;

    try {
        let pageNum: number = pageNumStr ? parseInt(pageNumStr) : 1;
        let pageSize: number = pageSizeStr ? parseInt(pageSizeStr) : 10;

        if (pageNum < 1 || pageSize < 1) {
            res.json({ code: 400, message: 'bad request' })
            return;
        }

        res.json(await dbService.listUser(key, pageNum, pageSize));
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
    let operator = req.user.id;

    res.json(await dbService.auditProposal(proposalId, status, operator));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/proposal/add', async (req, res) => {
    if (!req.user.activate) {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    let { title, link } = req.body;
    if (!title || !link) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }

    res.json(await dbService.addProposal({ id: uuidV1(), title, link, creator: req.user.id, createTime: Date.now(), status: 'new' }));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/proposal/my', async (req, res) => {
    let pageNumStr = req.query.pageNum as string;
    let pageSizeStr = req.query.pageSize as string;
    let userId: string = req.user.id;

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
router.get('/proposal/listAll', async (req, res) => {
    let pageNumStr = req.query.pageNum as string;
    let pageSizeStr = req.query.pageSize as string;
    let title = req.query.title as string;

    try {
        let pageNum = pageNumStr ? parseInt(pageNumStr) : 1;
        let pageSize = pageSizeStr ? parseInt(pageSizeStr) : 10;

        if (pageNum < 1 || pageSize < 1) {
            res.json({ code: 400, message: 'bad request' })
            return;
        }

        res.json(await dbService.listAllProposal(title, pageNum, pageSize));

    } catch (e) {
        console.log(e);
        res.json({ code: 400, message: 'bad request' });
        return;
    }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/proposal/listCanVote', async (req, res) => {
    let pageNumStr = req.query.pageNum as string;
    let pageSizeStr = req.query.pageSize as string;
    let title = req.query.title as string;

    try {
        let pageNum: number = pageNumStr ? parseInt(pageNumStr) : 1;
        let pageSize: number = pageSizeStr ? parseInt(pageSizeStr) : 10;

        if (pageNum < 1 || pageSize < 1) {
            res.json({ code: 400, message: 'bad request' })
            return;
        }

        res.json(await dbService.listCanVoteProposal(title, pageNum, pageSize));

    } catch (e) {
        console.log(e);
        res.json({ code: 400, message: 'bad request' });
        return;
    }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/proposal/vote/:id', async (req, res) => {
    let id = req.params.id;
    let userId = req.user.id;

    if (!id) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }

    res.json(await dbService.vote(id, userId));
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/proposal/userHaveVoted', async (req, res) => {
    let userId = req.user.id;
    res.json(await dbService.userHaveVoted(userId));
})

export default router;
