import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

export const methods = {
  loadOptions: {
    // Load entities from Home Assistant
    async searchEntities(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
      const credentials = await this.getCredentials('homeAssistantWebSocketApi');
      const host = credentials.host as string;
      const accessToken = credentials.accessToken as string;
      const allowUnauthorizedCerts = credentials.allowUnauthorizedCerts as boolean;

      // Make API request to get entities
      const options = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        rejectUnauthorized: !allowUnauthorizedCerts,
      };

      // Check if helpers.request exists
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

      // Format entities for display
      return response.map((entity: any) => {
        const friendlyName = entity.attributes.friendly_name || entity.entity_id;
        return {
          name: `${friendlyName} (${entity.entity_id})`,
          value: entity.entity_id,
          description: `Current state: ${entity.state}`,
        };
      }).sort((a, b) => a.name.localeCompare(b.name));
    },

    // Load domains from Home Assistant
    async searchDomains(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
      const credentials = await this.getCredentials('homeAssistantWebSocketApi');
      const host = credentials.host as string;
      const accessToken = credentials.accessToken as string;
      const allowUnauthorizedCerts = credentials.allowUnauthorizedCerts as boolean;

      // Make API request to get services
      const options = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        rejectUnauthorized: !allowUnauthorizedCerts,
      };

      // Check if helpers.request exists
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

      // Extract unique domains
      const domains = [...new Set(response.map((service: any) => service.domain))];

      // Format domains for display
      return domains.map((domain: string) => ({
        name: domain,
        value: domain,
      })).sort((a, b) => a.name.localeCompare(b.name));
    },

    // Load services for a specific domain
    async searchServices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
      const credentials = await this.getCredentials('homeAssistantWebSocketApi');
      const host = credentials.host as string;
      const accessToken = credentials.accessToken as string;
      const allowUnauthorizedCerts = credentials.allowUnauthorizedCerts as boolean;

      // Get the selected domain
      const domainData = this.getNodeParameter('domain', { extractValue: true }) as string;
      if (!domainData) {
        return [];
      }

      // Make API request to get services
      const options = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        rejectUnauthorized: !allowUnauthorizedCerts,
      };

      // Check if helpers.request exists
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

      // Filter services for the selected domain
      const domainServices = response.filter((service: any) => service.domain === domainData);
      
      if (domainServices.length === 0 || !domainServices[0].services) {
        return [];
      }

      // Format services for display
      const services = domainServices[0].services;
      return Object.keys(services).map((serviceKey) => ({
        name: services[serviceKey].name || serviceKey,
        value: serviceKey,
        description: services[serviceKey].description || '',
      })).sort((a, b) => a.name.localeCompare(b.name));
    },

    // Load automations from Home Assistant
    async searchAutomations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
      const credentials = await this.getCredentials('homeAssistantWebSocketApi');
      const host = credentials.host as string;
      const accessToken = credentials.accessToken as string;
      const allowUnauthorizedCerts = credentials.allowUnauthorizedCerts as boolean;

      // Make API request to get entities
      const options = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        rejectUnauthorized: !allowUnauthorizedCerts,
      };

      // Check if helpers.request exists
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

      // Filter for automation entities
      const automations = response.filter((entity: any) => entity.entity_id.startsWith('automation.'));

      // Format automations for display
      return automations.map((automation: any) => {
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