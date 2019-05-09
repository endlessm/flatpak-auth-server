const process = require('process');
const request = require('request-promise-native');

const logger = require('./logger');

require('request-debug')(request, (type, data) => {
    logger.debug(`${type}: ${JSON.stringify(data, null, 2)}`);
});

function isDevelopment () {
    return process.env.NODE_ENV === 'development';
}

module.exports = {
    isDevelopment,
    request,
};
