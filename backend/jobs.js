const schedule = require('node-schedule');

let config = require('./config');


module.exports = {
    run: function() {
        logger.info("========= CR community voting service start =============")

        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

        let now = Date.now();


        schedule.scheduleJob({start: new Date(now + 61 * 1000), rule: '0 */2 * * * *'}, () => {


        });
    }
}
