import { Request, Response } from 'express';
import { Model, Instance } from 'sequelize';
import { IOptions, IParameters } from 'express-param-converter';

function hasAttribute(request: Request, name: string): boolean {
    return typeof request.params[name] !== 'undefined';
}

function getIdentifier(request: Request, name: string): string {
    if (hasAttribute(request, name)) {
        return request.params[name];
    }

    if (hasAttribute(request, 'id')) {
        return request.params.id;
    }

    return '';
}

function findById(model: Model<any, any>, request, options, name): Promise<Instance<any> | null> {
    const identifier = getIdentifier(request, name);

    if (identifier === '' || identifier === null) {
        return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => model.findById(identifier)
        .then(resolve, reject));
}

function findOne(model: Model<any, any>, request: Request, options: IOptions): Promise<Instance<any> | null> {
    const { mappings = {} } = options;

    if (Object.keys(mappings).length === 0) {
        return Promise.resolve(null);
    }

    const criteria = {};

    for (const alias in mappings) {
        const field: string = mappings[alias];

        const identifier = getIdentifier(request, alias);

        if (identifier) {
            criteria[field] = identifier;
        }
    }

    return new Promise((resolve, reject) => model.findOne({ where: criteria })
        .then(resolve, reject));
}

function modelParamConverter(parameters: IParameters | any = {}) {
    const { name, model, options = {} } = parameters;

    return (req: Request, res: Response, next) => {
        let isOptional: boolean = false;

        if (!model || typeof model === 'undefined') {
            return next(new Error('Model is not defined!'));
        }

        if (!hasAttribute(req, name)) {
            isOptional = true;
        }

        return findById(model, req, options, name)
            .then((resource: Instance<any> | null) => resource || findOne(model, req, options))
            .then((resource: Instance<any> | null) => {
                if (!resource) {
                    if (isOptional) {
                        return next(new Error('Unable to guess how to get a instance from the request information.'));
                    }

                    return next(new Error(`${(model as any).toString()} not found!`));
                }

                if (typeof options.plain !== 'undefined' && options.plain === true) {
                    return resource.get({ plain: true });
                }

                return resource;
            })
            .then((resource: Instance<any> | null) => {
                req.params[name] = resource;

                return next();
            })
            .catch(next);
    };
}

export { modelParamConverter as default };
