import { EventFilter, HomeAssistantCredentials } from './types';
export declare class WebSocketHandler {
    private readonly logger;
    private readonly credentials;
    private readonly wsUrl;
    private readonly wsOptions;
    private readonly eventType;
    private readonly actualEventType;
    private readonly filter;
    private readonly eventCallback;
    private state;
    constructor(credentials: HomeAssistantCredentials, eventType: string, actualEventType: string, filter: EventFilter, eventCallback: (eventData: any) => void);
    connect(): Promise<void>;
    poll(): Promise<any[]>;
    close(): void;
    private connectWebSocket;
}
