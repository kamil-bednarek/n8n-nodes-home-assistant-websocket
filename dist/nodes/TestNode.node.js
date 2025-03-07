"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestNode = void 0;
class TestNode {
    constructor() {
        this.description = {
            displayName: 'Test Node',
            name: 'testNode',
            group: ['transform'],
            version: 1,
            description: 'Basic test node',
            defaults: {
                name: 'Test',
            },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Test Field',
                    name: 'testField',
                    type: 'string',
                    default: '',
                    description: 'Test field description',
                },
            ],
        };
    }
    async execute() {
        return [[]];
    }
}
exports.TestNode = TestNode;
//# sourceMappingURL=TestNode.node.js.map