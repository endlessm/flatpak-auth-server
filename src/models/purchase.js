'use strict';

const DataTypes = require('sequelize').DataTypes;

const common = require('./common');

module.exports = sequelize => {
    const Purchase = common.createModel(sequelize, 'Purchase', {
        prefix: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['prefix', 'username'],
            },
        ],
    });

    Purchase.associate = models => {
        Purchase.belongsTo(models.Repo, {
            foreignKey: {
                allowNull: false,
            },
        });
    };

    return Purchase;
};
