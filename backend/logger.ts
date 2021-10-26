import log4js from "log4js";

log4js.configure({
  appenders: { voting: { type: 'dateFile', filename: 'logs/voting.log', pattern: ".yyyy-MM-dd.log", compress: true, } },
  categories: { default: { appenders: ['voting'], level: 'info' } },
  pm2: true,
  pm2InstanceVar: 'INSTANCE_ID'
});

const logger = log4js.getLogger('voting');
export default logger;