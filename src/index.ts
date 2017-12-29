import { Request, Response } from 'express';
import { Model, Instance } from 'sequelize';
import { IOptions, IParameters } from '../types';

class ExpressParamConverter {
    public convert(parameters: IParameters | any = {}) {
        const { name, model, options = {} } : { name: string, model: Model<any, any> | any, options: IOptions | any } = parameters;

        return (req: Request, res: Response, next) => {
            let isOptional: boolean = false;

            if (!model || typeof model === 'undefined') {
                throw new Error('Model is not defined!');
            }

            if (!this.hasAttribute(req, name)) {
                isOptional = true;
            }

            return this.findById(model, req, name)
                .then((resource: Instance<any> | null) => resource || this.findOne(model, req, options))
                .then((resource: Instance<any> | null) => {
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
                .then((resource: Instance<any> | null) => {
                    req.params[name] = resource;

                    return next();
                })
                .catch(next);
        };
    }

    private findById(model: Model<any, any>, request: Request, name: string): Promise<Instance<any> | null> {
        const identifier = this.getIdentifier(request, name);

        if (identifier === '' || identifier === null) {
            return Promise.resolve(null);
        }

        return new Promise((resolve, reject) => model.findById(identifier)
            .then(resolve, reject));
    }

    private findOne(model: Model<any, any>, request: Request, options: IOptions | any): Promise<Instance<any> | null> {
        const { mappings = {} } = options;

        if (Object.keys(mappings).length === 0) {
            return Promise.resolve(null);
        }

        const criteria = {};

        for (const alias in mappings) {
            const field: string = mappings[alias];

            const identifier = this.getIdentifier(request, alias);

            if (identifier) {
                criteria[field] = identifier;
            }
        }

        return new Promise((resolve, reject) => model.findOne({ where: criteria })
            .then(resolve, reject));
    }

    private getIdentifier(request: Request, name: string): string {
        if (this.hasAttribute(request, name)) {
            return request.params[name];
        }

        if (this.hasAttribute(request, 'id')) {
            return request.params.id;
        }

        return '';
    }

    private hasAttribute(request: Request, name: string): boolean {
        return typeof request.params[name] !== 'undefined';
    }
}

module.exports = new ExpressParamConverter();
