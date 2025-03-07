import { INodeTypeDescription } from 'n8n-workflow';

export const nodeDescription: INodeTypeDescription = {
  displayName: 'Home Assistant WebSocket Trigger',
  name: 'homeAssistantTrigger',
  icon: 'file:home-assistant.svg',
  group: ['trigger'],
  version: 1,
  subtitle: '={{$parameter["eventType"]}}',
  description: 'Triggers a workflow when Home Assistant events occur via WebSocket',
  defaults: {
    name: 'Home Assistant WebSocket Trigger',
  },
  inputs: [],
  outputs: ['main'],
  credentials: [
    {
      name: 'homeAssistantWebSocketApi',
      required: true,
    },
  ],
  properties: [
    {
      displayName: 'Event Type',
      name: 'eventType',
      type: 'options',
      options: [
        {
          name: 'State Changed',
          value: 'state_changed',
          description: 'When the state of an entity changes',
        },
        {
          name: 'Service Executed',
          value: 'call_service',
          description: 'When a service is called',
        },
        {
          name: 'Automation Triggered',
          value: 'automation_triggered',
          description: 'When an automation is triggered',
        },
        {
          name: 'Any Event',
          value: 'any',
          description: 'Listen for any event type',
        },
        {
          name: 'Custom Event',
          value: 'custom',
          description: 'Listen for a custom event type',
        },
      ],
      default: 'state_changed',
      required: true,
    },
    {
      displayName: 'Custom Event Type',
      name: 'customEventType',
      type: 'string',
      displayOptions: {
        show: {
          eventType: ['custom'],
        },
      },
      default: '',
      description: 'The custom event type to listen for',
      required: true,
    },
    {
      displayName: 'Entity',
      name: 'entityId',
      type: 'string',
      default: '',
      required: true,
      displayOptions: {
        show: {
          eventType: ['state_changed'],
        },
        hide: {
          monitorAllEntities: [true],
        },
      },
      description: 'The entity to monitor (e.g., light.living_room)',
    },
    {
      displayName: 'Monitor All Entities',
      name: 'monitorAllEntities',
      type: 'boolean',
      default: false,
      displayOptions: {
        show: {
          eventType: ['state_changed'],
        },
      },
      description: 'Whether to monitor all entities instead of a specific one',
    },
    {
      displayName: 'Domain',
      name: 'domain',
      type: 'string',
      default: '',
      required: true,
      displayOptions: {
        show: {
          eventType: ['call_service'],
        },
        hide: {
          monitorAllDomains: [true],
        },
      },
      description: 'The domain to monitor (e.g., light, switch)',
    },
    {
      displayName: 'Monitor All Domains',
      name: 'monitorAllDomains',
      type: 'boolean',
      default: false,
      displayOptions: {
        show: {
          eventType: ['call_service'],
        },
      },
      description: 'Whether to monitor all domains instead of a specific one',
    },
    {
      displayName: 'Service',
      name: 'service',
      type: 'string',
      default: '',
      required: true,
      displayOptions: {
        show: {
          eventType: ['call_service'],
          monitorAllDomains: [false],
        },
        hide: {
          monitorAllServices: [true],
        },
      },
      description: 'The service to monitor',
    },
    {
      displayName: 'Monitor All Services',
      name: 'monitorAllServices',
      type: 'boolean',
      default: false,
      displayOptions: {
        show: {
          eventType: ['call_service'],
          monitorAllDomains: [false],
        },
      },
      description: 'Whether to monitor all services instead of a specific one',
    },
    {
      displayName: 'Automation',
      name: 'automationId',
      type: 'string',
      default: '',
      required: true,
      displayOptions: {
        show: {
          eventType: ['automation_triggered'],
        },
        hide: {
          monitorAllAutomations: [true],
        },
      },
      description: 'The automation to monitor',
    },
    {
      displayName: 'Monitor All Automations',
      name: 'monitorAllAutomations',
      type: 'boolean',
      default: false,
      displayOptions: {
        show: {
          eventType: ['automation_triggered'],
        },
      },
      description: 'Whether to monitor all automations instead of a specific one',
    },
  ],
}; 