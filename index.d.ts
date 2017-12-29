declare class ExpressParamConverter {
    convert(parameters: ExpressParamConverter.IParameters | any);
}

declare namespace ExpressParamConverter {
    function convert(parameters: ExpressParamConverter.IParameters | any);

    export interface IOptions {
        mappings: object;
        plain: boolean;
    }

    export interface IParameters {
        name: string;
        model: any;
        options: IOptions;
    }
}

export = ExpressParamConverter;
