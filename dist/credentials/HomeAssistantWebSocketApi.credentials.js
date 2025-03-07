"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeAssistantWebSocketApi = void 0;
class HomeAssistantWebSocketApi {
    constructor() {
        this.name = 'homeAssistantWebSocketApi';
        this.displayName = 'Home Assistant WebSocket API';
        this.documentationUrl = 'https://www.home-assistant.io/docs/authentication/';
        this.properties = [
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
}
exports.HomeAssistantWebSocketApi = HomeAssistantWebSocketApi;
//# sourceMappingURL=HomeAssistantWebSocketApi.credentials.js.map