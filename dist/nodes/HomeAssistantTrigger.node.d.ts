import { ITriggerFunctions, INodeType, ITriggerResponse } from 'n8n-workflow';
export declare class HomeAssistantTrigger implements INodeType {
    description: import("n8n-workflow").INodeTypeDescription;
    methods: {
        loadOptions: {
            searchEntities(this: import("n8n-workflow").ILoadOptionsFunctions): Promise<import("n8n-workflow").INodePropertyOptions[]>;
            searchDomains(this: import("n8n-workflow").ILoadOptionsFunctions): Promise<import("n8n-workflow").INodePropertyOptions[]>;
            searchServices(this: import("n8n-workflow").ILoadOptionsFunctions): Promise<import("n8n-workflow").INodePropertyOptions[]>;
            searchAutomations(this: import("n8n-workflow").ILoadOptionsFunctions): Promise<import("n8n-workflow").INodePropertyOptions[]>;
        };
    };
    trigger(this: ITriggerFunctions): Promise<ITriggerResponse>;
}
