import { CreatifyApiOptions } from '../types';
import { LipsyncV2 } from '../types';
import { ICreatifyApiClient } from '../types/api-client';
import { apiClientFactory } from '../client-factory';

/**
 * Client for interacting with the Creatify Lipsync v2 API
 * @see https://creatify.mintlify.app/api-reference/lipsyncs_v2
 */
export class LipsyncV2Api {
  private client: ICreatifyApiClient;

  /**
   * Create a new LipsyncV2Api instance
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
   * Create a lipsync v2 video with multiple AI avatars speaking
   * @param params Parameters for the lipsync v2 video generation
   * @returns Promise resolving to the lipsync v2 task response
   * @see https://creatify.mintlify.app/api-reference/lipsyncs_v2/post-apilipsyncs
   */
  async createLipsyncV2(
    params: LipsyncV2.LipsyncV2Params
  ): Promise<LipsyncV2.LipsyncV2Response> {
    try {
      return await this.client.post<LipsyncV2.LipsyncV2Response>('/api/lipsyncs_v2/', params);
    } catch (error) {
      console.error('Error creating lipsync v2:', error);
      throw error;
    }
  }

  /**
   * Get the status and result of a lipsync v2 task
   * @param id ID of the lipsync v2 task
   * @returns Promise resolving to the lipsync v2 task status and result
   * @see https://creatify.mintlify.app/api-reference/lipsyncs_v2/get-apilipsyncs-
   */
  async getLipsyncV2(id: string): Promise<LipsyncV2.LipsyncV2ResultResponse> {
    try {
      return await this.client.get<LipsyncV2.LipsyncV2ResultResponse>(`/api/lipsyncs_v2/${id}/`);
    } catch (error) {
      console.error(`Error fetching lipsync v2 result for ID ${id}:`, error);
      // Return a default response to prevent crashes
      return {
        id,
        status: 'error',
        error_message: error instanceof Error ? error.message : 'An error occurred with the API request',
        success: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as LipsyncV2.LipsyncV2ResultResponse;
    }
  }

  /**
   * Get all lipsync v2 tasks
   * @returns Promise resolving to an array of lipsync v2 tasks
   * @see https://creatify.mintlify.app/api-reference/lipsyncs_v2/get-apilipsyncs
   */
  async getLipsyncsV2(): Promise<LipsyncV2.LipsyncV2ResultResponse[]> {
    try {
      const results = await this.client.get<LipsyncV2.LipsyncV2ResultResponse[]>('/api/lipsyncs_v2/');
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error('Error fetching lipsync v2 tasks:', error);
      return [];
    }
  }

  /**
   * Generate a preview of a lipsync v2 video
   * @param id ID of the lipsync v2 task
   * @returns Promise resolving to the lipsync v2 task response
   * @see https://creatify.mintlify.app/api-reference/lipsyncs_v2/post-apilipsyncs-preview
   */
  async generateLipsyncV2Preview(
    id: string
  ): Promise<LipsyncV2.LipsyncV2Response> {
    return this.client.post<LipsyncV2.LipsyncV2Response>(`/api/lipsyncs_v2/${id}/preview/`, {});
  }

  /**
   * Render a lipsync v2 video
   * @param id ID of the lipsync v2 task
   * @returns Promise resolving to the lipsync v2 task response
   * @see https://creatify.mintlify.app/api-reference/lipsyncs_v2/post-apilipsyncs-render
   */
  async renderLipsyncV2(
    id: string
  ): Promise<LipsyncV2.LipsyncV2Response> {
    return this.client.post<LipsyncV2.LipsyncV2Response>(`/api/lipsyncs_v2/${id}/render/`, {});
  }

  /**
   * Create a lipsync v2 video and wait for it to complete
   * @param params Parameters for the lipsync v2 video generation
   * @param pollInterval How often to check status in ms (default 2000)
   * @param maxAttempts Maximum number of polling attempts (default 30)
   * @returns Promise resolving to the completed lipsync v2 task
   */
  async createAndWaitForLipsyncV2(
    params: LipsyncV2.LipsyncV2Params,
    pollInterval: number = 2000,
    maxAttempts: number = 30
  ): Promise<LipsyncV2.LipsyncV2ResultResponse> {
    try {
      // Create the lipsync v2 task
      const response = await this.createLipsyncV2(params);

      // Poll for completion
      let attempts = 0;
      let result = await this.getLipsyncV2(response.id);

      while (
        attempts < maxAttempts &&
        result.status !== 'done' &&
        result.status !== 'error'
      ) {
        // Wait for the specified interval
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        // Check the status again
        result = await this.getLipsyncV2(response.id);
        attempts++;
      }

      // Check if we reached max attempts without completion
      if (attempts >= maxAttempts && result.status !== 'done' && result.status !== 'error') {
        const error = new Error(`Lipsync v2 task ${response.id} did not complete within the timeout period`);
        // Create a result with error status
        return {
          id: response.id,
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          success: false,
          created_at: result.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      return result;
    } catch (error) {
      // Handle any unexpected errors
      console.error('Error in createAndWaitForLipsyncV2:', error);
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
