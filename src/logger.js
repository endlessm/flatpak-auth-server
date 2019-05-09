const winston = require('winston');

const logger = winston.createLogger({
    level: 'debug',
    transports: [
        new winston.transports.Console({
            format: winston.format.cli(),
        }),
    ],
});

logger.stream = {
    write: message => {
        logger.info(message);
    },
};

module.exports = logger;
