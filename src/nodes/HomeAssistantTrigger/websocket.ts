import WebSocket from 'ws';
import { EventFilter, HomeAssistantCredentials, WebSocketState } from './types';

export class WebSocketHandler {
  // Define logger as any to avoid type errors
  private readonly logger: any;
  private readonly credentials: HomeAssistantCredentials;
  private readonly wsUrl: string;
  private readonly wsOptions: WebSocket.ClientOptions;
  private readonly eventType: string;
  private readonly actualEventType: string;
  private readonly filter: EventFilter;
  private readonly eventCallback: (eventData: any) => void;
  private state: WebSocketState = {
    ws: undefined,
    messageId: 1,
    authenticated: false,
    subscriptionId: null,
    eventQueue: [],
    isConnected: false,
  };

  constructor(
    credentials: HomeAssistantCredentials,
    eventType: string,
    actualEventType: string,
    filter: EventFilter,
    eventCallback: (eventData: any) => void
  ) {
    // Use console.log as a fallback if logger is not available
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

    // Format the WebSocket URL
    let wsUrl = credentials.host.replace(/^http/, 'ws');
    if (!wsUrl.endsWith('/')) {
      wsUrl += '/';
    }
    wsUrl += 'api/websocket';
    this.wsUrl = wsUrl;

    // Set WebSocket options
    this.wsOptions = {
      rejectUnauthorized: !credentials.allowUnauthorizedCerts,
    };
  }

  public async connect(): Promise<void> {
    return this.connectWebSocket();
  }

  public async poll(): Promise<any[]> {
    // If not connected, try to reconnect
    if (!this.state.isConnected) {
      try {
        await this.connectWebSocket();
      } catch (error) {
        this.logger.error('Failed to reconnect to Home Assistant', { error });
        return [];
      }
    }

    // Return any events that have been collected and clear the queue
    if (this.state.eventQueue.length === 0) {
      return [];
    }

    const returnData = this.state.eventQueue.map(event => ({ json: event }));
    this.state.eventQueue = [];
    return returnData;
  }

  public close(): void {
    console.log('WebSocket handler close method called');
    if (this.state.ws) {
      try {
        // Remove all event listeners to prevent memory leaks
        this.state.ws.removeAllListeners();
        
        // Close the connection if it's open
        if (this.state.ws.readyState === WebSocket.OPEN) {
          this.state.ws.close();
          this.logger.info('WebSocket connection closed');
        }
        
        // Set to undefined to allow garbage collection
        this.state.ws = undefined;
        this.state.isConnected = false;
      } catch (error) {
        this.logger.error('Error closing WebSocket connection', { error });
      }
    }
  }

  private connectWebSocket(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const ws = new WebSocket(this.wsUrl, this.wsOptions);
        this.state.ws = ws;
        this.state.messageId = 1;
        this.state.authenticated = false;
        this.state.subscriptionId = null;

        ws.on('open', () => {
          this.logger.debug('WebSocket connection opened to Home Assistant');
          this.state.isConnected = true;
        });

        ws.on('message', async (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            // this.logger.debug('Received message from Home Assistant', { message });

            // Handle authentication
            if (message.type === 'auth_required') {
              ws.send(JSON.stringify({
                type: 'auth',
                access_token: this.credentials.accessToken,
              }));
            } else if (message.type === 'auth_ok') {
              this.state.authenticated = true;
              this.logger.debug('Successfully authenticated with Home Assistant');

              // Subscribe to events
              if (this.eventType === 'any') {
                // Subscribe to all events
                ws.send(JSON.stringify({
                  id: this.state.messageId,
                  type: 'subscribe_events',
                }));
                this.state.subscriptionId = this.state.messageId;
                this.state.messageId++;
              } else {
                // Subscribe to specific event type
                ws.send(JSON.stringify({
                  id: this.state.messageId,
                  type: 'subscribe_events',
                  event_type: this.actualEventType,
                }));
                this.state.subscriptionId = this.state.messageId;
                this.state.messageId++;
              }

              resolve();
            } else if (message.type === 'auth_invalid') {
              this.logger.error('Authentication failed with Home Assistant', { message });
              reject(new Error('Authentication failed with Home Assistant: ' + message.message));
            } else if (message.type === 'result' && message.success && message.id === this.state.subscriptionId) {
              this.logger.debug('Successfully subscribed to events', { message });
            } else if (message.type === 'event' && message.id === this.state.subscriptionId) {
              // Process the event
              const eventData = message.event;
              
              // Apply filters based on event type
              let passesFilter = true;
              
              if (this.eventType === 'state_changed' && !this.filter.monitorAll && this.filter.entityId) {
                if (eventData.data.entity_id !== this.filter.entityId) {
                  passesFilter = false; // Skip this event as it doesn't match our filter
                }
              } else if (this.eventType === 'call_service' && !this.filter.monitorAll) {
                if (this.filter.domain && eventData.data.domain !== this.filter.domain) {
                  passesFilter = false; // Skip this event as it doesn't match our domain filter
                }
                if (this.filter.service && eventData.data.service !== this.filter.service) {
                  passesFilter = false; // Skip this event as it doesn't match our service filter
                }
              } else if (this.eventType === 'automation_triggered' && !this.filter.monitorAll && this.filter.automationId) {
                if (eventData.data.entity_id !== this.filter.automationId) {
                  passesFilter = false; // Skip this event as it doesn't match our automation filter
                }
              }

              // If the event passes the filter, call the callback
              if (passesFilter) {
                console.log(`Event passed filter: ${eventData.event_type} for entity ${eventData.data?.entity_id || 'unknown'}`);
                this.eventCallback(eventData);
              } else {
                console.log(`Event filtered out: ${eventData.event_type} for entity ${eventData.data?.entity_id || 'unknown'}`);
              }
            }
          } catch (error) {
            this.logger.error('Error processing WebSocket message', { error });
          }
        });

        ws.on('error', (error: Error) => {
          this.logger.error('WebSocket error', { error });
          this.state.isConnected = false;
          reject(error);
        });

        ws.on('close', (code: number, reason: Buffer) => {
          this.logger.warn('WebSocket connection closed', { code, reason: reason.toString() });
          this.state.isConnected = false;
          
          // Attempt to reconnect after a delay
          setTimeout(() => {
            this.logger.debug('Attempting to reconnect to Home Assistant');
            this.connectWebSocket().catch(error => {
              this.logger.error('Failed to reconnect to Home Assistant', { error });
            });
          }, 5000); // 5 second delay before reconnecting
        });
      } catch (error) {
        this.logger.error('Error creating WebSocket connection', { error });
        this.state.isConnected = false;
        reject(error);
      }
    });
  }
} 