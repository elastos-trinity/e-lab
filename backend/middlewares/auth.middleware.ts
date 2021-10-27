import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Config } from "../config";
import { dbService } from "../services/db.service";

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.path !== "/api/v1/login") {
        let token = req.headers['token'] as string;
        if (token) {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            jwt.verify(token, Config.jwtSecret, async (error, decoded) => {
                if (error || !decoded) {
                    res.json({ code: 403, message: 'Token verify failed' })
                } else {
                    let user = await dbService.findUserByDID(decoded.did);
                    if (user) {
                        req.user = user;
                        next();
                    }
                }
            })
        } else {
            res.json({ code: 403, message: 'Can not find the token' });
        }
    } else {
        next();
    }
}
