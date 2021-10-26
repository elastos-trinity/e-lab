const jwt = require('jsonwebtoken');
const config = require('./config');
let indexDBService = require('./service/indexDBService');


let authMiddleware = function (req, res, next) {
    if(req.path !== "/api/v1/login") {
        let token = req.headers['token'];
        if(token) {
            jwt.verify(token, config.jwtSecret, async (error, decoded) => {
                if(error) {
                    res.json({code: 403, message: 'Token verify failed'})
                } else {
                    let result = await indexDBService.findUserByDID(decoded.did);
                    req.user = result[0];
                    next();
                }
            })
        } else {
            res.json({code: 403, message: 'Can not find the token'});
        }
    } else {
        next();
    }
}

module.exports = authMiddleware;
