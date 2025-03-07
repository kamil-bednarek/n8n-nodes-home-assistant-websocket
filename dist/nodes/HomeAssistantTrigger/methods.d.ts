import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
export declare const methods: {
    loadOptions: {
        searchEntities(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        searchDomains(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        searchServices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
        searchAutomations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]>;
    };
};
