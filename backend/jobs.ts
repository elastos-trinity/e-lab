import schedule from 'node-schedule';
import logger from './logger';

export function run() {
    logger.info("========= CR community voting service start =============")

    //const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

    let now = Date.now();

    schedule.scheduleJob({ start: new Date(now + 61 * 1000), rule: '0 */2 * * * *' }, () => {
    });
}
