import schedule from 'node-schedule';

export const run = () => {
    //const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

    let now = Date.now();

    schedule.scheduleJob({ start: new Date(now + 61 * 1000), rule: '0 */2 * * * *' }, () => {
    });
}
