declare namespace ExpressParamConverter {
    interface IOptions {
        mappings: object;
        plain: boolean;
    }

    interface IParameters {
        name: string;
        model: any;
        options: IOptions;
    }

    interface ModelParamConverter {
        modelParamConverter(parameter: IParameters | any);
    }
}

declare var ExpressParamConverter: ExpressParamConverter.ModelParamConverter;

export = ExpressParamConverter;
