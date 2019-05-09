const _ = require('lodash');
const createError = require('http-errors');
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const url = require('url');

const controllers = require('.');
const db = require('../models');
const logger = require('../logger');
const utils = require('../utils');

async function verifyToken (token) {
    const decodedToken = jwt.decode(token, {
        complete: true,
    });

    const iss = new url.URL(decodedToken.payload.iss);

    // `iss` would be something like:
    // https://cognito-idp.us-east-2.amazonaws.com/us-east-2_abcd1234
    if (iss.hostname.indexOf('cognito-idp') === 0) {
        const jwks = await utils.request.get(`${iss.toString()}/.well-known/jwks.json`).json();
        const key = jwks.keys.find(_key => _key.kid === decodedToken.header.kid);

        if (!key) {
            throw new Error('Could not find the corresponding kid');
        }

        return jwt.verify(token, jwkToPem(key));
    }

    // TODO: How we verify non-Cognito tokens?
    throw new Error('Unable to verify token');
}

async function createFlatManagerRepoTokenSubset (repo, username, prefixes) {
    return (await utils.request.post(repo.flatManagerTokenSubsetApiUri, {
        auth: {
            bearer: repo.extra.token,
        },
        json: true,
        body: {
            sub: 'build',
            scope: ['read'],
            prefixes,
            repos: [
                repo.flatManagerName,
            ],
            name: username,
            duration: 3600,
        },
    })).token;
}

function addPrefix (prefixesPerRepo, repo, prefix) {
    if (!prefixesPerRepo[repo.id]) {
        prefixesPerRepo[repo.id] = {
            repo: repo,
            prefixes: [],
        };
    }

    if (prefix === '') {
        prefixesPerRepo[repo.id].prefixes = [''];
    } else if (prefixesPerRepo[repo.id].prefixes[0] !== '') {
        prefixesPerRepo[repo.id].prefixes.push(prefix);
    }
}

async function getHackReposTokens (prefixesPerRepo, payload) {
    const iss = new url.URL(payload.iss);

    if (iss.hostname.indexOf('cognito-idp') !== 0) {
        return;
    }

    const cognitoGroupId = _.trim(iss.pathname, '/');

    const hackRepos = await db.Repo.findAll({
        where: {
            type: db.Repo.repoTypes.HACK,
        },
    });

    for (const repo of hackRepos) {
        if (repo.extra.cognitoGroupId === cognitoGroupId) {
            addPrefix(prefixesPerRepo, repo, '');
        }
    }
}

async function getPurchasesTokens (prefixesPerRepo, payload) {
    const purchases = await db.Purchase.findAll({
        where: {
            username: payload.username,
        },
        include: [db.Repo],
    });

    for (const purchase of purchases) {
        addPrefix(prefixesPerRepo, purchase.repo, purchase.prefix);
    }
}

async function getTokensAction (req, res) {
    if (!req.token) {
        throw createError(401);
    }

    let payload;
    try {
        payload = await verifyToken(req.token);
    } catch (e) {
        throw createError(401, e.message);
    }

    logger.debug(`Verified token with payload ${JSON.stringify(payload)}`);

    const prefixesPerRepo = {};

    await getHackReposTokens(prefixesPerRepo, payload);
    await getPurchasesTokens(prefixesPerRepo, payload);

    const tokens = [];
    for (const repoPrefixes of Object.values(prefixesPerRepo)) {
        const token = await createFlatManagerRepoTokenSubset(
            repoPrefixes.repo,
            payload.username,
            repoPrefixes.prefixes,
        );

        if (token) {
            tokens.push({
                repo: repoPrefixes.repo.url,
                prefixes: repoPrefixes.prefixes,
                token,
            });
        }
    }

    res.send({ tokens });
}

module.exports = {
    getTokensAction: controllers.dispatch(getTokensAction),
};
