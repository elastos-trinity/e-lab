import jwt from "jsonwebtoken";
import { Config } from "../config";
import { dbService } from "../services/db.service";

export function authMiddleware(req, res, next) {
    if (req.path !== "/api/v1/login") {
        let token = req.headers['token'];
        if (token) {
            jwt.verify(token, Config.jwtSecret, async (error, decoded) => {
                if (error) {
                    res.json({ code: 403, message: 'Token verify failed' })
                } else {
                    let result = await dbService.findUserByDID(decoded.did);
                    req.user = result[0];
                    next();
                }
            })
        } else {
            res.json({ code: 403, message: 'Can not find the token' });
        }
    } else {
        next();
    }
}
