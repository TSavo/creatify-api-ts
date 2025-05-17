import { CreatifyApiClient } from '../client';
import { CustomTemplates } from '../types';

/**
 * Client for interacting with the Creatify Custom Templates API
 */
export class CustomTemplatesApi extends CreatifyApiClient {
  /**
   * Create a video using a custom template
   * @param params Parameters for the custom template video generation
   * @returns Promise resolving to the custom template task response
   */
  async createCustomTemplate(
    params: CustomTemplates.CustomTemplateParams
  ): Promise<CustomTemplates.CustomTemplateResponse> {
    return this.post<CustomTemplates.CustomTemplateResponse>('/api/custom_templates/', params);
  }

  /**
   * Get the status and result of a custom template task
   * @param id ID of the custom template task
   * @returns Promise resolving to the custom template task status and result
   */
  async getCustomTemplate(id: string): Promise<CustomTemplates.CustomTemplateResultResponse> {
    return this.get<CustomTemplates.CustomTemplateResultResponse>(`/api/custom_templates/${id}/`);
  }

  /**
   * Get all custom template tasks
   * @returns Promise resolving to an array of custom template tasks
   */
  async getCustomTemplateList(): Promise<CustomTemplates.CustomTemplateResultResponse[]> {
    return this.get<CustomTemplates.CustomTemplateResultResponse[]>('/api/custom_templates/');
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
    
    while (
      attempts < maxAttempts &&
      result.status !== 'done' &&
      result.status !== 'error'
    ) {
      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Check the status again
      result = await this.getCustomTemplate(response.id);
      attempts++;
    }
    
    // Check if we reached max attempts without completion
    if (attempts >= maxAttempts && result.status !== 'done' && result.status !== 'error') {
      throw new Error(`Custom template task ${response.id} did not complete within the timeout period`);
    }
    
    return result;
  }
}