"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeAssistantTrigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const descriptions_1 = require("./HomeAssistantTrigger/descriptions");
const methods_1 = require("./HomeAssistantTrigger/methods");
const websocket_1 = require("./HomeAssistantTrigger/websocket");
class HomeAssistantTrigger {
    constructor() {
        this.description = descriptions_1.nodeDescription;
        this.methods = methods_1.methods;
    }
    async trigger() {
        const credentials = (await this.getCredentials('homeAssistantWebSocketApi'));
        const eventType = this.getNodeParameter('eventType');
        let actualEventType = eventType;
        if (eventType === 'custom') {
            actualEventType = this.getNodeParameter('customEventType');
        }
        const filter = {
            monitorAll: false,
        };
        if (eventType === 'state_changed') {
            filter.monitorAll = this.getNodeParameter('monitorAllEntities', false);
            if (!filter.monitorAll) {
                filter.entityId = this.getNodeParameter('entityId', { extractValue: true });
            }
        }
        else if (eventType === 'call_service') {
            filter.monitorAll = this.getNodeParameter('monitorAllDomains', false);
            if (!filter.monitorAll) {
                filter.domain = this.getNodeParameter('domain', { extractValue: true });
                const monitorAllServices = this.getNodeParameter('monitorAllServices', false);
                if (!monitorAllServices) {
                    filter.service = this.getNodeParameter('service', { extractValue: true });
                }
            }
        }
        else if (eventType === 'automation_triggered') {
            filter.monitorAll = this.getNodeParameter('monitorAllAutomations', false);
            if (!filter.monitorAll) {
                filter.automationId = this.getNodeParameter('automationId', { extractValue: true });
            }
        }
        if (!credentials.host || !credentials.accessToken) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Home Assistant host and access token are required');
        }
        const wsHandler = new websocket_1.WebSocketHandler(credentials, eventType, actualEventType, filter, (eventData) => {
            this.emit([[{
                        json: {
                            event_type: eventData.event_type,
                            data: eventData.data,
                            origin: eventData.origin,
                            time_fired: eventData.time_fired,
                            context: eventData.context,
                            timestamp: new Date().toISOString(),
                        },
                    }]]);
        });
        await wsHandler.connect();
        return {
            closeFunction: async () => {
                wsHandler.close();
            },
        };
    }
}
exports.HomeAssistantTrigger = HomeAssistantTrigger;
//# sourceMappingURL=HomeAssistantTrigger.node.js.map