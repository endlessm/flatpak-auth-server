'use strict';

const _ = require('lodash');
const DataTypes = require('sequelize').DataTypes;
const url = require('url');
const validator = require('validator');

const common = require('./common');
const utils = require('../utils');

module.exports = sequelize => {
    const repoTypes = {
        FLAT_MANAGER: 'flat-manager',
        HACK: 'hack',
    };

    const Repo = common.createModel(sequelize, 'Repo', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isUrl: value => {
                    if (!validator.isURL(value, {
                        require_protocol: true,
                        require_tld: !utils.isDevelopment(),
                    })) {
                        throw new Error('Validation isUrl on url failed');
                    }
                },
            },
        },
        extra: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        type: {
            // eslint-disable-next-line new-cap
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [Object.values(repoTypes)],
            },
        },
    }, {
        getterMethods: {
            flatManagerTokenSubsetApiUri () {
                return new url.URL(
                    'api/v1/token_subset',
                    new url.URL('../..', this.url).toString(),
                ).toString();
            },

            flatManagerName () {
                return _.trim(this.url, '/').split('/').pop();
            },
        },
        indexes: [
            {
                unique: true,
                fields: ['name'],
            },
            {
                unique: true,
                fields: ['url'],
            },
        ],
    });

    Repo.repoTypes = repoTypes;

    return Repo;
};

