"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ExpressParamConverter {
    convert(parameters = {}) {
        const { name, model, options = {} } = parameters;
        return (req, res, next) => {
            let isOptional = false;
            if (!model || typeof model === 'undefined') {
                throw new Error('Model is not defined!');
            }
            if (!this.hasAttribute(req, name)) {
                isOptional = true;
            }
            return this.findById(model, req, name)
                .then((resource) => resource || this.findOne(model, req, options))
                .then((resource) => {
                if (!resource) {
                    if (isOptional) {
                        const modelName = model.options.name.singular;
                        const errorMessage = `Value for model "${modelName}" with data "${this.getIdentifier(req, name)}" not found!`;
                        throw new Error(errorMessage);
                    }
                    throw new Error('Unable to guess how to get a instance from the request information.');
                }
                if (typeof options.plain !== 'undefined' && options.plain === true) {
                    return resource.get({ plain: true });
                }
                return resource;
            })
                .then((resource) => {
                req.params[name] = resource;
                return next();
            })
                .catch(next);
        };
    }
    findById(model, request, name) {
        const identifier = this.getIdentifier(request, name);
        if (identifier === '' || identifier === null) {
            return Promise.resolve(null);
        }
        return new Promise((resolve, reject) => model.findById(identifier)
            .then(resolve, reject));
    }
    findOne(model, request, options) {
        const { mappings = {} } = options;
        if (Object.keys(mappings).length === 0) {
            return Promise.resolve(null);
        }
        const criteria = {};
        for (const alias in mappings) {
            const field = mappings[alias];
            const identifier = this.getIdentifier(request, alias);
            if (identifier) {
                criteria[field] = identifier;
            }
        }
        return new Promise((resolve, reject) => model.findOne({ where: criteria })
            .then(resolve, reject));
    }
    getIdentifier(request, name) {
        if (this.hasAttribute(request, name)) {
            return request.params[name];
        }
        if (this.hasAttribute(request, 'id')) {
            return request.params.id;
        }
        return '';
    }
    hasAttribute(request, name) {
        return typeof request.params[name] !== 'undefined';
    }
}
module.exports = new ExpressParamConverter();
