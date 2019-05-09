'use-strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const config = require('config');

const logger = require('../logger');

const db = {};
const sequelize = new Sequelize({
    ...config.get('sequelize'),
    logging: (...args) => {
        logger.debug(args[0]);
    },
});

const basename = path.basename(__filename);
fs
    .readdirSync(__dirname)
    .filter(file => {
        return file.indexOf('.') !== 0 &&
               ![basename, 'common.js'].includes(file) &&
               file.slice(-3) === '.js';
    })
    .forEach(file => {
        const model = sequelize.import(path.join(__dirname, file));
        sequelizePaginate.paginate(model);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
