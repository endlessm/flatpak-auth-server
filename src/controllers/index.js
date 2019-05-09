const _ = require('lodash');
const inflection = require('inflection');
const createError = require('http-errors');
const express = require('express');
const util = require('util');

function dispatch (actionCallback) {
    return (req, res, next) => {
        const result = actionCallback(req, res, next);
        if (util.types.isPromise(result)) {
            result.catch(next);
        }
    };
}

class ModelCrudController {
    get model () {
        throw new Error('You must implement model getter');
    }

    get prefix () {
        return `/${inflection.underscore(this.model.name)}`;
    }

    injectToApp (app) {
        app.use(this.prefix, this.createMiddleware());
    }

    createMiddleware () {
        // eslint-disable-next-line new-cap
        const router = express.Router();

        router.get('/', dispatch(this.getAllAction.bind(this)));
        router.get('/:id', dispatch(this.getAction.bind(this)));
        router.post('/', dispatch(this.createAction.bind(this)));
        router.put('/:id', dispatch(this.updateAction.bind(this)));
        router.delete('/:id', dispatch(this.deleteAction.bind(this)));

        return router;
    }

    dispatch (actionCallback) {
        return (req, res, next) => {
            const result = actionCallback.bind(this)(req, res, next);
            if (util.types.isPromise(result)) {
                result.catch(next);
            }
        };
    }

    async findEntitiesPaginated (page) {
        return this.model.paginate({
            page: page,
        });
    }

    async findEntity (pk) {
        return this.model.findByPk(pk);
    }

    // eslint-disable-next-line no-unused-vars
    canReadEntity (entity) {
        return true;
    }

    // eslint-disable-next-line no-unused-vars
    canUpdateEntity (entity) {
        return true;
    }

    // eslint-disable-next-line no-unused-vars
    canDeleteEntity (entity) {
        return true;
    }

    get blacklistedProperties () {
        return [];
    }

    entityToJson (entity) {
        return _.omit(entity.toJSON(), this.blacklistedProperties);
    }

    sequelizeValidationErrorToJson (error) {
        return error.errors.reduce((previousValue, currentValue) => {
            previousValue[currentValue.path] = _.pick(currentValue, [
                'message',
                'type',
                'path',
                'value',
            ]);
            return previousValue;
        }, {});
    }

    async validateAndSaveEntity (res, entity) {
        try {
            await entity.validate();
        } catch (e) {
            res.status(400).send({
                error: this.sequelizeValidationErrorToJson(e),
            });
        }

        await entity.save();
        res.send(this.entityToJson(entity));
    }

    async getAllAction (req, res) {
        const page = parseInt(req.query.page || '1', 10);
        const { docs, pages, total } = await this.findEntitiesPaginated(page);

        res.send({
            results: docs.map(entity => this.entityToJson(entity)),
            pages,
            total,
        });
    }

    async getAction (req, res) {
        const entity = await this.findEntity(req.params.id);

        if (!entity || !this.canReadEntity(entity)) {
            throw createError(404);
        }

        res.send(this.entityToJson(entity));
    }

    async createAction (req, res) {
        // eslint-disable-next-line new-cap
        const entity = new this.model(req.body);
        await this.validateAndSaveEntity(res, entity);
    }

    async updateAction (req, res) {
        const entity = await this.findEntity(req.params.id);

        if (!entity || !this.canUpdateEntity(entity)) {
            throw createError(404);
        }

        entity.set(req.body);

        await this.validateAndSaveEntity(res, entity);
    }

    async deleteAction (req, res) {
        const entity = await this.findEntity(req.params.id);

        if (!entity || !this.canDeleteEntity(entity)) {
            throw createError(404);
        }

        await entity.destroy();

        res.status(204).send();
    }
}

class SimpleModelCrudController extends ModelCrudController {
    constructor (model) {
        super();

        this._model = model;
    }

    get model () {
        return this._model;
    }
}

module.exports = {
    dispatch,
    ModelCrudController,
    SimpleModelCrudController,
};
