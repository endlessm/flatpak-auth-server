require('./init');

const bearerToken = require('express-bearer-token');
const express = require('express');
const morgan = require('morgan');
const process = require('process');

const logger = require('./logger');
const db = require('./models');
const PurchaseController = require('./controllers/purchaseController');
const RepoController = require('./controllers/repoController');
const tokenController = require('./controllers/tokenController');

function createApi () {
    const api = express();

    // TODO: Add authorization middleware

    new PurchaseController().injectToApp(api);
    new RepoController().injectToApp(api);

    return api;
}

async function main () {
    if (process.env.FLATPAK_ENTITLEMENTS_SERVER_FORCE_SEQUELIZE_SYNC === '1') {
        logger.info('Synchronizing sequelize models with database');
        await db.sequelize.sync();
    }

    const app = express();

    app.use(morgan('short', {
        stream: logger.stream,
    }));
    app.use(express.json());
    app.use(express.urlencoded({
        extended: true,
    }));
    app.use(bearerToken());

    app.use('/api/v1', createApi());

    app.get('/tokens', tokenController.getTokensAction);

    const listeningPort = process.env.FLATPAK_ENTITLEMENTS_SERVER_LISTENING_PORT;
    app.listen(listeningPort, () => {
        logger.debug(`App listening on port ${listeningPort}`);
    });
}

main();
