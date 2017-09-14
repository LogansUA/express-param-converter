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
    const identifier = getIdentifier(request, name);

    if (identifier === false || identifier === null) {
        return Promise.resolve(false);
    }

    return new Promise((resolve, reject) => model.findById(identifier)
        .then((resource) => {
            if (typeof options.plain !== 'undefined' && options.plain === true) {
                return resolve(resource.get({ plain: true }));
            }

            return resolve(resource);
        }, reject));
}

function findOneBy(model, request, options) {
    const { mappings = {} } = options;

    if (Object.keys(mappings).length === 0) {
        return Promise.resolve(false);
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
        .then((resource) => {
            if (typeof options.plain !== 'undefined' && options.plain === true) {
                return resolve(resource.get({ plain: true }));
            }

            return resolve(resource);
        }, reject));
}

function modelParamConverter(parameters = {}) {
    const { name, model, options = {} } = parameters;

    return (req, res, next) => {
        let isOptional = false;

        if (!model || typeof model !== 'object') {
            return next(new Error('Model is not defined!'));
        }

        if (!hasAttribute(req, name)) {
            isOptional = true;
        }

        return find(model, req, options, name)
            .then(resource => resource || findOneBy(model, req, options))
            .then((resource) => {
                if (!resource) {
                    if (isOptional) {
                        return next(new Error('Unable to guess how to get a instance from the request information.'));
                    } else {
                        return next(new Error(`${model.toString()} not found!`));
                    }
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

export { modelParamConverter as default };
