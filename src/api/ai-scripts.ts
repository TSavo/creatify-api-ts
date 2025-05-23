import { CreatifyApiOptions } from '../types';
import { AiScripts } from '../types';
import { ICreatifyApiClient } from '../types/api-client';
import { apiClientFactory } from '../client-factory';

/**
 * Client for interacting with the Creatify AI Scripts API
 * @see https://creatify.mintlify.app/api-reference/ai-scripts
 */
export class AiScriptsApi {
  private client: ICreatifyApiClient;

  /**
   * Create a new AiScriptsApi instance
   * @param options API client options
   * @param clientFactory Optional factory for creating API clients (useful for testing)
   */
  constructor(options: CreatifyApiOptions, clientFactory = apiClientFactory) {
    this.client = clientFactory.createClient(options);
  }

  /**
   * Generate an AI Script from a text prompt
   * @param params Parameters for the AI Script generation
   * @returns Promise resolving to the AI Script task response
   * @see https://creatify.mintlify.app/api-reference/ai-scripts/post-ai-scripts
   */
  async createAiScript(params: AiScripts.AiScriptsParams): Promise<AiScripts.AiScriptsResponse> {
    return this.client.post<AiScripts.AiScriptsResponse>('/api/ai_scripts/', params);
  }

  /**
   * Get the status and result of an AI Script task
   * @param id ID of the AI Script task
   * @returns Promise resolving to the AI Script task status and result
   * @see https://creatify.mintlify.app/api-reference/ai-scripts/get-ai-scripts-
   */
  async getAiScript(id: string): Promise<AiScripts.AiScriptsResultResponse> {
    try {
      return await this.client.get<AiScripts.AiScriptsResultResponse>(`/api/ai_scripts/${id}/`);
    } catch (error) {
      console.error(`Error fetching AI Script result for ID ${id}:`, error);
      // Return a default response to prevent crashes
      return {
        id,
        status: 'error',
        error_message:
          error instanceof Error ? error.message : 'An error occurred with the API request',
        success: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as AiScripts.AiScriptsResultResponse;
    }
  }

  /**
   * Get all AI Script tasks
   * @returns Promise resolving to an array of AI Script tasks
   * @see https://creatify.mintlify.app/api-reference/ai-scripts/get-ai-scripts
   */
  async getAiScriptsList(): Promise<AiScripts.AiScriptsResultResponse[]> {
    try {
      const results =
        await this.client.get<AiScripts.AiScriptsResultResponse[]>('/api/ai_scripts/');
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error('Error fetching AI Script tasks:', error);
      return [];
    }
  }

  /**
   * Create an AI Script and wait for it to complete
   * @param params Parameters for the AI Script generation
   * @param pollInterval How often to check status in ms (default 2000)
   * @param maxAttempts Maximum number of polling attempts (default 30)
   * @returns Promise resolving to the completed AI Script task
   */
  async createAndWaitForAiScript(
    params: AiScripts.AiScriptsParams,
    pollInterval: number = 2000,
    maxAttempts: number = 30
  ): Promise<AiScripts.AiScriptsResultResponse> {
    try {
      // Create the AI Script task
      const response = await this.createAiScript(params);

      // Poll for completion
      let attempts = 0;
      let result = await this.getAiScript(response.id);

      while (attempts < maxAttempts && result.status !== 'done' && result.status !== 'error') {
        // Wait for the specified interval
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        // Check the status again
        result = await this.getAiScript(response.id);
        attempts++;
      }

      // Check if we reached max attempts without completion
      if (attempts >= maxAttempts && result.status !== 'done' && result.status !== 'error') {
        const error = new Error(
          `AI Script task ${response.id} did not complete within the timeout period`
        );
        // Create a result with error status
        return {
          id: response.id,
          status: 'error',
          error_message: error.message,
          success: false,
          created_at: result.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      return result;
    } catch (error) {
      // Handle any unexpected errors
      console.error('Error in createAndWaitForAiScript:', error);
      return {
        id: 'error',
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  }
}
