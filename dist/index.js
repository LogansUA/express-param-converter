"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hasAttribute(request, name) {
    return typeof request.params[name] !== 'undefined';
}
function getIdentifier(request, name) {
    if (hasAttribute(request, name)) {
        return request.params[name];
    }
    if (hasAttribute(request, 'id')) {
        return request.params.id;
    }
    return '';
}
function findById(model, request, options, name) {
    const identifier = getIdentifier(request, name);
    if (identifier === '' || identifier === null) {
        return Promise.resolve(null);
    }
    return new Promise((resolve, reject) => model.findById(identifier)
        .then(resolve, reject));
}
function findOne(model, request, options) {
    const { mappings = {} } = options;
    if (Object.keys(mappings).length === 0) {
        return Promise.resolve(null);
    }
    const criteria = {};
    for (const alias in mappings) {
        const field = mappings[alias];
        const identifier = getIdentifier(request, alias);
        if (identifier) {
            criteria[field] = identifier;
        }
    }
    return new Promise((resolve, reject) => model.findOne({ where: criteria })
        .then(resolve, reject));
}
function modelParamConverter(parameters = {}) {
    const { name, model, options = {} } = parameters;
    return (req, res, next) => {
        let isOptional = false;
        if (!model || typeof model === 'undefined') {
            return next(new Error('Model is not defined!'));
        }
        if (!hasAttribute(req, name)) {
            isOptional = true;
        }
        return findById(model, req, options, name)
            .then((resource) => resource || findOne(model, req, options))
            .then((resource) => {
            if (!resource) {
                if (isOptional) {
                    return next(new Error('Unable to guess how to get a instance from the request information.'));
                }
                return next(new Error(`${model.toString()} not found!`));
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
exports.default = modelParamConverter;
