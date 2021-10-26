import { VerifiablePresentation } from '@elastosfoundation/did-js-sdk';
import express from 'express';
import jwt from 'jsonwebtoken';
import { v1 as uuidV1 } from 'uuid';
import { Config } from '../config';
import { dbService } from '../services/db.service';

let router = express.Router();

/* Used for service check. */
router.get('/check', function (req, res) {
    res.json({ code: 200, message: 'success' });
});

router.post('/login', async function (req, res) {
    let presentationStr = req.body;
    let vp = VerifiablePresentation.parse(presentationStr);
    let valid = await vp.isValid();
    if (!valid) {
        res.json({ code: 403, message: 'Credential verified failed' });
        return;
    }

    let did = vp.getHolder().getMethodSpecificId();
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

router.get('/currentUser', function (req, res) {
    res.json({ code: 200, message: 'success', data: req.user })
})

router.get('/active', async function (req, res) {
    let code = req.query.code;
    let did = req.user.did;

    res.json(await dbService.activateUser(did, code));
})

router.post('/user/add', async function (req, res) {
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
        id: uuidV1(), tgName, did, type: 'user', code,
        activate: false, createTime: Date.now()
    }));
})

router.get('/user/remove/:did', async function (req, res) {
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

router.get('/user/list', async function (req, res) {
    let pageNumStr = req.query.pageNum;
    let pageSizeStr = req.query.pageSize;
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

router.get('/proposal/audit/:id', async function (req, res) {
    if (req.user.type !== 'admin') {
        res.json({ code: 403, message: 'forbidden' });
        return;
    }

    let proposalId: string = req.params.id;
    let result: string = req.query.result;
    if (!proposalId || !result) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }

    let status = result === "rejected" ? "rejected" : "approved";
    let operator = req.user.id;

    res.json(await dbService.auditProposal(proposalId, status, operator));
})

router.post('/proposal/add', async function (req, res) {
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

router.get('/proposal/my', async function (req, res) {
    let pageNumStr: string = req.query.pageNum;
    let pageSizeStr: string = req.query.pageSize;
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

router.get('/proposal/listAll', async function (req, res) {
    let pageNumStr: string = req.query.pageNum;
    let pageSizeStr = req.query.pageSize;
    let title: string = req.query.title;

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

router.get('/proposal/listCanVote', async function (req, res) {
    let pageNumStr: string = req.query.pageNum;
    let pageSizeStr: string = req.query.pageSize;
    let title: string = req.query.title;

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

router.get('/proposal/vote/:id', async function (req, res) {
    let id = req.params.id;
    let userId = req.user.id;

    if (!id) {
        res.json({ code: 400, message: 'required parameter absence' });
        return;
    }

    res.json(await dbService.vote(id, userId));
})

router.get('/proposal/userHaveVoted', async function (req, res) {
    let userId = req.user.id;
    res.json(await dbService.userHaveVoted(userId));
})

export default router;
