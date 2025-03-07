import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HomeAssistantWebSocketApi implements ICredentialType {
	name = 'homeAssistantWebSocketApi';
	displayName = 'Home Assistant WebSocket API';
	documentationUrl = 'https://www.home-assistant.io/docs/authentication/';
	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: '',
			placeholder: 'https://your-home-assistant.example.com',
			description: 'The URL of your Home Assistant instance',
			required: true,
		},
		{
			displayName: 'Long-Lived Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'The long-lived access token from Home Assistant',
			required: true,
		},
		{
			displayName: 'Ignore SSL Issues',
			name: 'allowUnauthorizedCerts',
			type: 'boolean',
			default: false,
			description: 'Still connect even if SSL certificate validation is not possible',
		},
	];
} 