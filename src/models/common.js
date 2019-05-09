const _ = require('lodash');
const inflection = require('inflection');

function createModel (sequelize, modelName, attributes, options = {}) {
    const singular = _.lowerFirst(inflection.singularize(modelName));

    return sequelize.define(modelName, attributes, Object.assign(options, {
        tableName: singular,
        name: {
            singular,
            plural: _.lowerFirst(inflection.pluralize(modelName)),
        },
    }));
}

module.exports = {
    createModel,
};
