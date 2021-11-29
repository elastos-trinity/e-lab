import log4js from "log4js";

log4js.configure({
  appenders: {
    stdout: { type: 'stdout' },
    stderr: { type: 'stderr' },
    elab: { type: 'dateFile', filename: 'logs/elab.log', pattern: ".yyyy-MM-dd.log", compress: true, }
  },
  categories: { default: { appenders: ['stdout', 'elab'], level: 'info' } },
  pm2: true,
  pm2InstanceVar: 'INSTANCE_ID'
});

const logger = log4js.getLogger('elab');
export default logger;