"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketHandler = void 0;
const ws_1 = __importDefault(require("ws"));
class WebSocketHandler {
    constructor(credentials, eventType, actualEventType, filter, eventCallback) {
        this.state = {
            ws: undefined,
            messageId: 1,
            authenticated: false,
            subscriptionId: null,
            eventQueue: [],
            isConnected: false,
        };
        this.logger = {
            debug: console.log,
            info: console.log,
            warn: console.log,
            error: console.error,
        };
        this.credentials = credentials;
        this.eventType = eventType;
        this.actualEventType = actualEventType;
        this.filter = filter;
        this.eventCallback = eventCallback;
        let wsUrl = credentials.host.replace(/^http/, 'ws');
        if (!wsUrl.endsWith('/')) {
            wsUrl += '/';
        }
        wsUrl += 'api/websocket';
        this.wsUrl = wsUrl;
        this.wsOptions = {
            rejectUnauthorized: !credentials.allowUnauthorizedCerts,
        };
    }
    async connect() {
        return this.connectWebSocket();
    }
    async poll() {
        if (!this.state.isConnected) {
            try {
                await this.connectWebSocket();
            }
            catch (error) {
                this.logger.error('Failed to reconnect to Home Assistant', { error });
                return [];
            }
        }
        if (this.state.eventQueue.length === 0) {
            return [];
        }
        const returnData = this.state.eventQueue.map(event => ({ json: event }));
        this.state.eventQueue = [];
        return returnData;
    }
    close() {
        console.log('WebSocket handler close method called');
        if (this.state.ws) {
            try {
                this.state.ws.removeAllListeners();
                if (this.state.ws.readyState === ws_1.default.OPEN) {
                    this.state.ws.close();
                    this.logger.info('WebSocket connection closed');
                }
                this.state.ws = undefined;
                this.state.isConnected = false;
            }
            catch (error) {
                this.logger.error('Error closing WebSocket connection', { error });
            }
        }
    }
    connectWebSocket() {
        return new Promise((resolve, reject) => {
            try {
                const ws = new ws_1.default(this.wsUrl, this.wsOptions);
                this.state.ws = ws;
                this.state.messageId = 1;
                this.state.authenticated = false;
                this.state.subscriptionId = null;
                ws.on('open', () => {
                    this.logger.debug('WebSocket connection opened to Home Assistant');
                    this.state.isConnected = true;
                });
                ws.on('message', async (data) => {
                    var _a, _b;
                    try {
                        const message = JSON.parse(data.toString());
                        if (message.type === 'auth_required') {
                            ws.send(JSON.stringify({
                                type: 'auth',
                                access_token: this.credentials.accessToken,
                            }));
                        }
                        else if (message.type === 'auth_ok') {
                            this.state.authenticated = true;
                            this.logger.debug('Successfully authenticated with Home Assistant');
                            if (this.eventType === 'any') {
                                ws.send(JSON.stringify({
                                    id: this.state.messageId,
                                    type: 'subscribe_events',
                                }));
                                this.state.subscriptionId = this.state.messageId;
                                this.state.messageId++;
                            }
                            else {
                                ws.send(JSON.stringify({
                                    id: this.state.messageId,
                                    type: 'subscribe_events',
                                    event_type: this.actualEventType,
                                }));
                                this.state.subscriptionId = this.state.messageId;
                                this.state.messageId++;
                            }
                            resolve();
                        }
                        else if (message.type === 'auth_invalid') {
                            this.logger.error('Authentication failed with Home Assistant', { message });
                            reject(new Error('Authentication failed with Home Assistant: ' + message.message));
                        }
                        else if (message.type === 'result' && message.success && message.id === this.state.subscriptionId) {
                            this.logger.debug('Successfully subscribed to events', { message });
                        }
                        else if (message.type === 'event' && message.id === this.state.subscriptionId) {
                            const eventData = message.event;
                            let passesFilter = true;
                            if (this.eventType === 'state_changed' && !this.filter.monitorAll && this.filter.entityId) {
                                if (eventData.data.entity_id !== this.filter.entityId) {
                                    passesFilter = false;
                                }
                            }
                            else if (this.eventType === 'call_service' && !this.filter.monitorAll) {
                                if (this.filter.domain && eventData.data.domain !== this.filter.domain) {
                                    passesFilter = false;
                                }
                                if (this.filter.service && eventData.data.service !== this.filter.service) {
                                    passesFilter = false;
                                }
                            }
                            else if (this.eventType === 'automation_triggered' && !this.filter.monitorAll && this.filter.automationId) {
                                if (eventData.data.entity_id !== this.filter.automationId) {
                                    passesFilter = false;
                                }
                            }
                            if (passesFilter) {
                                console.log(`Event passed filter: ${eventData.event_type} for entity ${((_a = eventData.data) === null || _a === void 0 ? void 0 : _a.entity_id) || 'unknown'}`);
                                this.eventCallback(eventData);
                            }
                            else {
                                console.log(`Event filtered out: ${eventData.event_type} for entity ${((_b = eventData.data) === null || _b === void 0 ? void 0 : _b.entity_id) || 'unknown'}`);
                            }
                        }
                    }
                    catch (error) {
                        this.logger.error('Error processing WebSocket message', { error });
                    }
                });
                ws.on('error', (error) => {
                    this.logger.error('WebSocket error', { error });
                    this.state.isConnected = false;
                    reject(error);
                });
                ws.on('close', (code, reason) => {
                    this.logger.warn('WebSocket connection closed', { code, reason: reason.toString() });
                    this.state.isConnected = false;
                    setTimeout(() => {
                        this.logger.debug('Attempting to reconnect to Home Assistant');
                        this.connectWebSocket().catch(error => {
                            this.logger.error('Failed to reconnect to Home Assistant', { error });
                        });
                    }, 5000);
                });
            }
            catch (error) {
                this.logger.error('Error creating WebSocket connection', { error });
                this.state.isConnected = false;
                reject(error);
            }
        });
    }
}
exports.WebSocketHandler = WebSocketHandler;
//# sourceMappingURL=websocket.js.map