import { DIDBackend } from "@elastosfoundation/did-js-sdk";
import bodyParser from "body-parser";
import cors from "cors";
import debug from "debug";
import express from "express";
import http from "http";
import logger from "morgan";
import { AddressInfo } from "net";
import { MyDIDAdapter } from "./adapters/mydid.adapter";
import { run as runJobs } from "./jobs";
import traceLogger from "./logger";
import { authMiddleware } from "./middlewares/auth.middleware";
import router from "./routes/index";
import { normalizePort } from "./utils";
import { dbService } from './services/db.service';

let app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(authMiddleware)
app.use('/api/v1', router);

DIDBackend.initialize(new MyDIDAdapter())

runJobs();

let dbg = debug('elab-api:server');

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

// Connect the DB
dbService.connect().then(() => {
    traceLogger.info(`========= DB CONNECTION OK =============`);
    /**
     * Create HTTP server.
     */
    let server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */
    server.listen(port);

    /**
     * Event listener for HTTP server "error" event.
     */
    server.on('error', (error) => {
        /* if (error.syscall !== 'listen') {
            throw error;
        } */

        let bind = typeof port === 'string'
          ? 'Pipe ' + port
          : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.name) {
            case 'EACCES':
                throw new Error(bind + ' requires elevated privileges');
            case 'EADDRINUSE':
                throw new Error(bind + ' is already in use');
            default:
                throw error;
        }
    });

    /**
     * Event listener for HTTP server "listening" event.
     */
    server.on('listening', () => {
        let addr = server.address() as AddressInfo;
        if (!addr)
            throw new Error("No server address!");

        let bind = typeof addr === 'string'
          ? 'pipe ' + addr
          : 'port ' + addr.port;
        dbg('Listening on ' + bind);

        traceLogger.info(`========= ELAB service started with ${bind} =============`);
    });
})

