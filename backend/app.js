let express = require('express');
let cors = require('cors')
let logger = require('morgan');
let bodyParser = require('body-parser');
let DidSDK = require('@elastosfoundation/did-js-sdk');
let MyDIDAdapter = require('./service/MyDIDAdapter');
let indexRouter = require('./routes/index');
let jobs = require('./jobs');
let log4js = require('log4js');
let authMiddleware = require('./authMiddleware');

let app = express();

app.use(cors());
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(authMiddleware)
app.use('/api/v1', indexRouter);

DidSDK.DIDBackend.initialize(new MyDIDAdapter("mainnet"))

log4js.configure({
    appenders: { voting: { type: 'dateFile', filename: 'logs/voting.log', pattern: ".yyyy-MM-dd.log", compress: true, }},
    categories: { default: { appenders: ['voting'], level: 'info'}},
    pm2: true,
    pm2InstanceVar: 'INSTANCE_ID'
});
global.logger = log4js.getLogger('voting');

jobs.run()

module.exports = app;
