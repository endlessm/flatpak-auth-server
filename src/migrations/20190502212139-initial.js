'use strict';

module.exports = {
    async up (queryInterface, Sequelize) {
        await queryInterface.createTable(
            'repo',
            {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true,
                    'allowNull': false,
                },
                'name': {
                    'type': Sequelize.STRING,
                    'allowNull': false,
                },
                'url': {
                    'type': Sequelize.STRING,
                    'allowNull': false,
                },
                'extra': {
                    'type': Sequelize.JSON,
                    'allowNull': false,
                },
                'type': {
                    'type': Sequelize.STRING,
                    'allowNull': false,
                },
                'createdAt': {
                    'type': Sequelize.DATE,
                    'allowNull': false,
                },
                'updatedAt': {
                    'type': Sequelize.DATE,
                    'allowNull': false,
                },
            },
        );

        await queryInterface.createTable(
            'purchase',
            {
                'id': {
                    'type': Sequelize.INTEGER,
                    'autoIncrement': true,
                    'primaryKey': true,
                    'allowNull': false,
                },
                'prefix': {
                    'type': Sequelize.STRING,
                    'allowNull': false,
                },
                'username': {
                    'type': Sequelize.STRING,
                    'allowNull': false,
                },
                'createdAt': {
                    'type': Sequelize.DATE,
                    'allowNull': false,
                },
                'updatedAt': {
                    'type': Sequelize.DATE,
                    'allowNull': false,
                },
                'repoId': {
                    'type': Sequelize.INTEGER,
                    'onUpdate': 'CASCADE',
                    'onDelete': 'NO ACTION',
                    'references': {
                        'model': 'repo',
                        'key': 'id',
                    },
                    'allowNull': false,
                },
            },
        );

        await queryInterface.addIndex(
            'purchase',
            ['prefix', 'username'],
            {
                'indexName': 'purchase_prefix_username',
                'indicesType': 'UNIQUE',
            }
        );

        await queryInterface.addIndex(
            'repo',
            ['name'],
            {
                'indexName': 'repo_name',
                'indicesType': 'UNIQUE',
            }
        );

        await queryInterface.addIndex(
            'repo',
            ['url'],
            {
                'indexName': 'repo_url',
                'indicesType': 'UNIQUE',
            }
        );
    },

    async down (queryInterface) {
        await queryInterface.dropTable('purchase');
        await queryInterface.dropTable('repo');
    },
};
