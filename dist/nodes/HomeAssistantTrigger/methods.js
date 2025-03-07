"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = void 0;
exports.methods = {
    loadOptions: {
        async searchEntities() {
            const credentials = await this.getCredentials('homeAssistantWebSocketApi');
            const host = credentials.host;
            const accessToken = credentials.accessToken;
            const allowUnauthorizedCerts = credentials.allowUnauthorizedCerts;
            const options = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                rejectUnauthorized: !allowUnauthorizedCerts,
            };
            if (!this.helpers || !this.helpers.request) {
                throw new Error('Request helper is not available');
            }
            const response = await this.helpers.request({
                method: 'GET',
                url: `${host}/api/states`,
                headers: options.headers,
                rejectUnauthorized: options.rejectUnauthorized,
                json: true,
            });
            if (!Array.isArray(response)) {
                throw new Error('Invalid response from Home Assistant API');
            }
            return response.map((entity) => {
                const friendlyName = entity.attributes.friendly_name || entity.entity_id;
                return {
                    name: `${friendlyName} (${entity.entity_id})`,
                    value: entity.entity_id,
                    description: `Current state: ${entity.state}`,
                };
            }).sort((a, b) => a.name.localeCompare(b.name));
        },
        async searchDomains() {
            const credentials = await this.getCredentials('homeAssistantWebSocketApi');
            const host = credentials.host;
            const accessToken = credentials.accessToken;
            const allowUnauthorizedCerts = credentials.allowUnauthorizedCerts;
            const options = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                rejectUnauthorized: !allowUnauthorizedCerts,
            };
            if (!this.helpers || !this.helpers.request) {
                throw new Error('Request helper is not available');
            }
            const response = await this.helpers.request({
                method: 'GET',
                url: `${host}/api/services`,
                headers: options.headers,
                rejectUnauthorized: options.rejectUnauthorized,
                json: true,
            });
            if (!Array.isArray(response)) {
                throw new Error('Invalid response from Home Assistant API');
            }
            const domains = [...new Set(response.map((service) => service.domain))];
            return domains.map((domain) => ({
                name: domain,
                value: domain,
            })).sort((a, b) => a.name.localeCompare(b.name));
        },
        async searchServices() {
            const credentials = await this.getCredentials('homeAssistantWebSocketApi');
            const host = credentials.host;
            const accessToken = credentials.accessToken;
            const allowUnauthorizedCerts = credentials.allowUnauthorizedCerts;
            const domainData = this.getNodeParameter('domain', { extractValue: true });
            if (!domainData) {
                return [];
            }
            const options = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                rejectUnauthorized: !allowUnauthorizedCerts,
            };
            if (!this.helpers || !this.helpers.request) {
                throw new Error('Request helper is not available');
            }
            const response = await this.helpers.request({
                method: 'GET',
                url: `${host}/api/services`,
                headers: options.headers,
                rejectUnauthorized: options.rejectUnauthorized,
                json: true,
            });
            if (!Array.isArray(response)) {
                throw new Error('Invalid response from Home Assistant API');
            }
            const domainServices = response.filter((service) => service.domain === domainData);
            if (domainServices.length === 0 || !domainServices[0].services) {
                return [];
            }
            const services = domainServices[0].services;
            return Object.keys(services).map((serviceKey) => ({
                name: services[serviceKey].name || serviceKey,
                value: serviceKey,
                description: services[serviceKey].description || '',
            })).sort((a, b) => a.name.localeCompare(b.name));
        },
        async searchAutomations() {
            const credentials = await this.getCredentials('homeAssistantWebSocketApi');
            const host = credentials.host;
            const accessToken = credentials.accessToken;
            const allowUnauthorizedCerts = credentials.allowUnauthorizedCerts;
            const options = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                rejectUnauthorized: !allowUnauthorizedCerts,
            };
            if (!this.helpers || !this.helpers.request) {
                throw new Error('Request helper is not available');
            }
            const response = await this.helpers.request({
                method: 'GET',
                url: `${host}/api/states`,
                headers: options.headers,
                rejectUnauthorized: options.rejectUnauthorized,
                json: true,
            });
            if (!Array.isArray(response)) {
                throw new Error('Invalid response from Home Assistant API');
            }
            const automations = response.filter((entity) => entity.entity_id.startsWith('automation.'));
            return automations.map((automation) => {
                const friendlyName = automation.attributes.friendly_name || automation.entity_id;
                return {
                    name: friendlyName,
                    value: automation.entity_id,
                    description: `Current state: ${automation.state}`,
                };
            }).sort((a, b) => a.name.localeCompare(b.name));
        },
    },
};
//# sourceMappingURL=methods.js.map