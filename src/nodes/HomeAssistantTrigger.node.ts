import {
	ITriggerFunctions,
	INodeType,
	ITriggerResponse,
	NodeOperationError,
} from 'n8n-workflow';
import { nodeDescription } from './HomeAssistantTrigger/descriptions';
import { methods } from './HomeAssistantTrigger/methods';
import { WebSocketHandler } from './HomeAssistantTrigger/websocket';
import { EventFilter, HomeAssistantCredentials } from './HomeAssistantTrigger/types';

export class HomeAssistantTrigger implements INodeType {
	description = nodeDescription;
	methods = methods;

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = (await this.getCredentials(
			'homeAssistantWebSocketApi',
		)) as unknown as HomeAssistantCredentials;

		const eventType = this.getNodeParameter('eventType') as string;
		let actualEventType = eventType;

		if (eventType === 'custom') {
			actualEventType = this.getNodeParameter('customEventType') as string;
		}

		// Get filter parameters based on event type
		const filter: EventFilter = {
			monitorAll: false,
		};

		if (eventType === 'state_changed') {
			filter.monitorAll = this.getNodeParameter('monitorAllEntities', false) as boolean;
			if (!filter.monitorAll) {
				filter.entityId = this.getNodeParameter('entityId', { extractValue: true }) as string;
			}
		} else if (eventType === 'call_service') {
			filter.monitorAll = this.getNodeParameter('monitorAllDomains', false) as boolean;
			if (!filter.monitorAll) {
				filter.domain = this.getNodeParameter('domain', { extractValue: true }) as string;

				const monitorAllServices = this.getNodeParameter('monitorAllServices', false) as boolean;
				if (!monitorAllServices) {
					filter.service = this.getNodeParameter('service', { extractValue: true }) as string;
				}
			}
		} else if (eventType === 'automation_triggered') {
			filter.monitorAll = this.getNodeParameter('monitorAllAutomations', false) as boolean;
			if (!filter.monitorAll) {
				filter.automationId = this.getNodeParameter('automationId', { extractValue: true }) as string;
			}
		}

		// Validate credentials
		if (!credentials.host || !credentials.accessToken) {
			throw new NodeOperationError(
				this.getNode(),
				'Home Assistant host and access token are required',
			);
		}

		const wsHandler = new WebSocketHandler(
			credentials,
			eventType,
			actualEventType,
			filter,
			(eventData) => {
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
			},
		);

		await wsHandler.connect();
		
		return {
			closeFunction: async () => {
				wsHandler.close();
			},
		};
	}
}