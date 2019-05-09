const db = require('../models');
const controllers = require('.');

class RepoController extends controllers.ModelCrudController {
    get model () {
        return db.Repo;
    }

    get blacklistedProperties () {
        return ['extra'];
    }
}

module.exports = RepoController;
