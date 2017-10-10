'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

    return false;
}

function find(model, request, options, name) {
    var identifier = getIdentifier(request, name);

    if (identifier === false || identifier === null) {
        return Promise.resolve(false);
    }

    return new Promise(function (resolve, reject) {
        return model.findById(identifier).then(function (resource) {
            if (typeof options.plain !== 'undefined' && options.plain === true) {
                return resolve(resource.get({ plain: true }));
            }

            return resolve(resource);
        }, reject);
    });
}

function findOneBy(model, request, options) {
    var _options$mappings = options.mappings,
        mappings = _options$mappings === undefined ? {} : _options$mappings;


    if (Object.keys(mappings).length === 0) {
        return Promise.resolve(false);
    }

    var criteria = {};

    for (var alias in mappings) {
        var field = mappings[alias];

        var identifier = getIdentifier(request, alias);

        if (identifier) {
            criteria[field] = identifier;
        }
    }

    return new Promise(function (resolve, reject) {
        return model.findOne({ where: criteria }).then(resolve, reject);
    });
}

function modelParamConverter() {
    var parameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var name = parameters.name,
        model = parameters.model,
        _parameters$options = parameters.options,
        options = _parameters$options === undefined ? {} : _parameters$options;


    return function (req, res, next) {
        var isOptional = false;

        if (!model || (typeof model === 'undefined' ? 'undefined' : _typeof(model)) !== 'object') {
            return next(new Error('Model is not defined!'));
        }

        if (!hasAttribute(req, name)) {
            isOptional = true;
        }

        return find(model, req, options, name).then(function (resource) {
            return resource || findOneBy(model, req, options);
        }).then(function (resource) {
            if (!resource) {
                if (isOptional) {
                    return next(new Error('Unable to guess how to get a instance from the request information.'));
                } else {
                    return next(new Error(model.toString() + ' not found!'));
                }
            }

            if (typeof options.plain !== 'undefined' && options.plain === true) {
                return resource.get({ plain: true });
            }

            return resource;
        }).then(function (resource) {
            req.params[name] = resource;

            return next();
        }).catch(next);
    };
}

exports.default = modelParamConverter;