import { INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class TestNode implements INodeType {
    description: INodeTypeDescription;
    execute(): Promise<never[][]>;
}
