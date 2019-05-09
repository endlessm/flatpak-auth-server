const db = require('../models');
const controllers = require('.');

class PurchaseController extends controllers.ModelCrudController {
    get model () {
        return db.Purchase;
    }
}

module.exports = PurchaseController;
