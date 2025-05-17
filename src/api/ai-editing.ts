import { CreatifyApiOptions } from '../types';
import { AiEditing } from '../types';
import { ICreatifyApiClient } from '../types/api-client';
import { apiClientFactory } from '../client-factory';

/**
 * Client for interacting with the Creatify AI Editing API
 * @see https://creatify.mintlify.app/api-reference/ai-editing
 */
export class AiEditingApi {
  private client: ICreatifyApiClient;

  /**
   * Create a new AiEditingApi instance
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
   * Create an AI editing task to edit a video with AI
   * @param params Parameters for the AI editing task
   * @returns Promise resolving to the AI editing task response
   * @see https://creatify.mintlify.app/api-reference/ai-editing
   */
  async createAiEditing(
    params: AiEditing.AiEditingParams
  ): Promise<AiEditing.AiEditingResponse> {
    return this.client.post<AiEditing.AiEditingResponse>('/api/ai_editing/', params);
  }

  /**
   * Get the status and result of an AI editing task
   * @param id ID of the AI editing task
   * @returns Promise resolving to the AI editing task status and result
   * @see https://creatify.mintlify.app/api-reference/ai-editing
   */
  async getAiEditing(id: string): Promise<AiEditing.AiEditingResultResponse> {
    return this.client.get<AiEditing.AiEditingResultResponse>(`/api/ai_editing/${id}/`);
  }

  /**
   * Get all AI editing tasks
   * @returns Promise resolving to an array of AI editing tasks
   * @see https://creatify.mintlify.app/api-reference/ai-editing
   */
  async getAiEditingList(): Promise<AiEditing.AiEditingResultResponse[]> {
    return this.client.get<AiEditing.AiEditingResultResponse[]>('/api/ai_editing/');
  }

  /**
   * Helper method to create an AI editing task and wait for completion
   * @param params Parameters for the AI editing task
   * @param pollInterval Interval in milliseconds to check for completion (default: 5000)
   * @param maxAttempts Maximum number of polling attempts (default: 120, about 10 minutes)
   * @returns Promise resolving to the final AI editing result
   */
  async createAndWaitForAiEditing(
    params: AiEditing.AiEditingParams,
    pollInterval = 5000,
    maxAttempts = 120
  ): Promise<AiEditing.AiEditingResultResponse> {
    // Create the AI editing task
    const response = await this.createAiEditing(params);
    
    // Poll for completion
    let attempts = 0;
    let result = await this.getAiEditing(response.id);
    
    while (
      attempts < maxAttempts &&
      result.status !== 'done' &&
      result.status !== 'error'
    ) {
      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Check the status again
      result = await this.getAiEditing(response.id);
      attempts++;
    }
    
    // Check if we reached max attempts without completion
    if (attempts >= maxAttempts && result.status !== 'done' && result.status !== 'error') {
      throw new Error(`AI editing task ${response.id} did not complete within the timeout period`);
    }
    
    return result;
  }
}