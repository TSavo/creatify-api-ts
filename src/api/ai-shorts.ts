import { CreatifyApiOptions } from '../types';
import { AiShorts } from '../types';
import { ICreatifyApiClient } from '../types/api-client';
import { apiClientFactory } from '../client-factory';

/**
 * Client for interacting with the Creatify AI Shorts API
 * @see https://creatify.mintlify.app/api-reference/ai-shorts
 */
export class AiShortsApi {
  private client: ICreatifyApiClient;

  /**
   * Create a new AiShortsApi instance
   * @param options API client options
   * @param clientFactory Optional factory for creating API clients (useful for testing)
   */
  constructor(
    options: CreatifyApiOptions,
    clientFactory = apiClientFactory
  ) {
    this.client = clientFactory.createClient(options);
  }

  /**
   * Create an AI Shorts task to generate a video from a text prompt
   * @param params Parameters for the AI Shorts task
   * @returns Promise resolving to the AI Shorts task response
   * @see https://creatify.mintlify.app/api-reference/ai-shorts/post-ai-shorts
   */
  async createAiShorts(
    params: AiShorts.AiShortsParams
  ): Promise<AiShorts.AiShortsResponse> {
    return this.client.post<AiShorts.AiShortsResponse>('/api/ai_shorts/', params);
  }

  /**
   * Get the status and result of an AI Shorts task
   * @param id ID of the AI Shorts task
   * @returns Promise resolving to the AI Shorts task status and result
   * @see https://creatify.mintlify.app/api-reference/ai-shorts/get-ai-shorts-
   */
  async getAiShorts(id: string): Promise<AiShorts.AiShortsResultResponse> {
    try {
      return await this.client.get<AiShorts.AiShortsResultResponse>(`/api/ai_shorts/${id}/`);
    } catch (error) {
      console.error(`Error fetching AI Shorts result for ID ${id}:`, error);
      // Return a default response to prevent crashes
      return {
        id,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'An error occurred with the API request',
        success: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as AiShorts.AiShortsResultResponse;
    }
  }

  /**
   * Get all AI Shorts tasks
   * @returns Promise resolving to an array of AI Shorts tasks
   * @see https://creatify.mintlify.app/api-reference/ai-shorts/get-ai-shorts
   */
  async getAiShortsList(): Promise<AiShorts.AiShortsResultResponse[]> {
    try {
      const results = await this.client.get<AiShorts.AiShortsResultResponse[]>('/api/ai_shorts/');
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error('Error fetching AI Shorts tasks:', error);
      return [];
    }
  }

  /**
   * Generate a preview of an AI Shorts video
   * @param id ID of the AI Shorts task
   * @returns Promise resolving to the AI Shorts task response
   * @see https://creatify.mintlify.app/api-reference/ai-shorts/post-ai-shorts-preview
   */
  async generateAiShortsPreview(
    id: string
  ): Promise<AiShorts.AiShortsResponse> {
    return this.client.post<AiShorts.AiShortsResponse>(`/api/ai_shorts/${id}/preview/`, {});
  }

  /**
   * Render an AI Shorts video
   * @param id ID of the AI Shorts task
   * @returns Promise resolving to the AI Shorts task response
   * @see https://creatify.mintlify.app/api-reference/ai-shorts/post-ai-shorts-render
   */
  async renderAiShorts(
    id: string
  ): Promise<AiShorts.AiShortsResponse> {
    return this.client.post<AiShorts.AiShortsResponse>(`/api/ai_shorts/${id}/render/`, {});
  }

  /**
   * Create an AI Shorts video and wait for it to complete
   * @param params Parameters for the AI Shorts video generation
   * @param pollInterval How often to check status in ms (default 2000)
   * @param maxAttempts Maximum number of polling attempts (default 30)
   * @returns Promise resolving to the completed AI Shorts task
   */
  async createAndWaitForAiShorts(
    params: AiShorts.AiShortsParams,
    pollInterval: number = 2000,
    maxAttempts: number = 30
  ): Promise<AiShorts.AiShortsResultResponse> {
    try {
      // Create the AI Shorts task
      const response = await this.createAiShorts(params);

      // Poll for completion
      let attempts = 0;
      let result = await this.getAiShorts(response.id);

      while (
        attempts < maxAttempts &&
        result.status !== 'done' &&
        result.status !== 'error'
      ) {
        // Wait for the specified interval
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        // Check the status again
        result = await this.getAiShorts(response.id);
        attempts++;
      }

      // Check if we reached max attempts without completion
      if (attempts >= maxAttempts && result.status !== 'done' && result.status !== 'error') {
        const error = new Error(`AI Shorts task ${response.id} did not complete within the timeout period`);
        // Create a result with error status
        return {
          id: response.id,
          status: 'error',
          error_message: error.message,
          success: false,
          created_at: result.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      return result;
    } catch (error) {
      // Handle any unexpected errors
      console.error('Error in createAndWaitForAiShorts:', error);
      return {
        id: 'error',
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }
}
