import WebSocket from 'ws';
import { ICredentialDataDecryptedObject } from 'n8n-workflow';
export interface HomeAssistantCredentials extends ICredentialDataDecryptedObject {
    host: string;
    accessToken: string;
    allowUnauthorizedCerts: boolean;
}
export interface WebSocketOptions {
    rejectUnauthorized: boolean;
}
export interface WebSocketState {
    ws: WebSocket | undefined;
    messageId: number;
    authenticated: boolean;
    subscriptionId: number | null;
    eventQueue: any[];
    isConnected: boolean;
}
export interface EventFilter {
    entityId?: string;
    domain?: string;
    service?: string;
    automationId?: string;
    monitorAll: boolean;
}
