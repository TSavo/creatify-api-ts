import { CreatifyApiOptions } from '../types';
import { CustomTemplates } from '../types';
import { ICreatifyApiClient } from '../types/api-client';
import { apiClientFactory } from '../client-factory';

/**
 * Client for interacting with the Creatify Custom Templates API
 * @see https://creatify.mintlify.app/api-reference/custom-templates
 */
export class CustomTemplatesApi {
  private client: ICreatifyApiClient;

  /**
   * Create a new CustomTemplatesApi instance
   * @param options API client options
   * @param clientFactory Optional factory for creating API clients (useful for testing)
   */
  constructor(options: CreatifyApiOptions, clientFactory = apiClientFactory) {
    this.client = clientFactory.createClient(options);
  }
  /**
   * Create a video using a custom template
   * @param params Parameters for the custom template video generation
   * @returns Promise resolving to the custom template task response
   * @see https://creatify.mintlify.app/api-reference/custom-templates
   */
  async createCustomTemplate(
    params: CustomTemplates.CustomTemplateParams
  ): Promise<CustomTemplates.CustomTemplateResponse> {
    return this.client.post<CustomTemplates.CustomTemplateResponse>(
      '/api/custom_templates/',
      params
    );
  }

  /**
   * Get the status and result of a custom template task
   * @param id ID of the custom template task
   * @returns Promise resolving to the custom template task status and result
   * @see https://creatify.mintlify.app/api-reference/custom-templates
   */
  async getCustomTemplate(id: string): Promise<CustomTemplates.CustomTemplateResultResponse> {
    return this.client.get<CustomTemplates.CustomTemplateResultResponse>(
      `/api/custom_templates/${id}/`
    );
  }

  /**
   * Get all custom template tasks
   * @returns Promise resolving to an array of custom template tasks
   * @see https://creatify.mintlify.app/api-reference/custom-templates
   */
  async getCustomTemplateList(): Promise<CustomTemplates.CustomTemplateResultResponse[]> {
    return this.client.get<CustomTemplates.CustomTemplateResultResponse[]>(
      '/api/custom_templates/'
    );
  }

  /**
   * Helper method to create a custom template video and wait for completion
   * @param params Parameters for the custom template video generation
   * @param pollInterval Interval in milliseconds to check for completion (default: 5000)
   * @param maxAttempts Maximum number of polling attempts (default: 120, about 10 minutes)
   * @returns Promise resolving to the final custom template result
   */
  async createAndWaitForCustomTemplate(
    params: CustomTemplates.CustomTemplateParams,
    pollInterval = 5000,
    maxAttempts = 120
  ): Promise<CustomTemplates.CustomTemplateResultResponse> {
    // Create the custom template task
    const response = await this.createCustomTemplate(params);

    // Poll for completion
    let attempts = 0;
    let result = await this.getCustomTemplate(response.id);

    while (attempts < maxAttempts && result.status !== 'done' && result.status !== 'error') {
      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      // Check the status again
      result = await this.getCustomTemplate(response.id);
      attempts++;
    }

    // Check if we reached max attempts without completion
    if (attempts >= maxAttempts && result.status !== 'done' && result.status !== 'error') {
      throw new Error(
        `Custom template task ${response.id} did not complete within the timeout period`
      );
    }

    return result;
  }
}
