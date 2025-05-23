import { CreatifyApiOptions } from '../types';
import { TextToSpeech } from '../types';
import { ICreatifyApiClient } from '../types/api-client';
import { apiClientFactory } from '../client-factory';

/**
 * Client for interacting with the Creatify Text-to-Speech API
 * @see https://creatify.mintlify.app/api-reference/text-to-speech
 */
export class TextToSpeechApi {
  private client: ICreatifyApiClient;

  /**
   * Create a new TextToSpeechApi instance
   * @param options API client options
   * @param clientFactory Optional factory for creating API clients (useful for testing)
   */
  constructor(options: CreatifyApiOptions, clientFactory = apiClientFactory) {
    this.client = clientFactory.createClient(options);
  }
  /**
   * Create a text-to-speech task to convert text into an audio file
   * @param params Parameters for the text-to-speech generation
   * @returns Promise resolving to the text-to-speech task response
   * @see https://creatify.mintlify.app/api-reference/text-to-speech/post-text-to-speech
   */
  async createTextToSpeech(
    params: TextToSpeech.TextToSpeechParams
  ): Promise<TextToSpeech.TextToSpeechResponse> {
    return this.client.post<TextToSpeech.TextToSpeechResponse>('/api/text_to_speech/', params);
  }

  /**
   * Get the status and result of a text-to-speech task
   * @param id ID of the text-to-speech task
   * @returns Promise resolving to the text-to-speech task status and result
   * @see https://creatify.mintlify.app/api-reference/text-to-speech/get-text-to-speech-
   */
  async getTextToSpeech(id: string): Promise<TextToSpeech.TextToSpeechResultResponse> {
    return this.client.get<TextToSpeech.TextToSpeechResultResponse>(`/api/text_to_speech/${id}/`);
  }

  /**
   * Get all text-to-speech tasks
   * @param page Page number (starts from 1)
   * @param limit Number of items per page
   * @returns Promise resolving to an array of text-to-speech tasks
   * @see https://creatify.mintlify.app/api-reference/text-to-speech/get-text-to-speech
   */
  async getTextToSpeechList(
    page?: number,
    limit?: number
  ): Promise<TextToSpeech.TextToSpeechResultResponse[]> {
    return this.client.get<TextToSpeech.TextToSpeechResultResponse[]>('/api/text_to_speech/', {
      page,
      limit,
    });
  }

  /**
   * Get paginated list of text-to-speech tasks
   * @param page Page number (starts from 1)
   * @param limit Number of items per page
   * @returns Promise resolving to paginated text-to-speech data
   * @see https://creatify.mintlify.app/api-reference/text-to-speech/get-text-to-speech
   */
  async getTextToSpeechPaginated(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: TextToSpeech.TextToSpeechResultResponse[];
  }> {
    return this.client.get('/api/text_to_speech/paginated/', { page, limit });
  }

  /**
   * Helper method to create a text-to-speech and wait for completion
   * @param params Parameters for the text-to-speech generation
   * @param pollInterval Interval in milliseconds to check for completion (default: 5000)
   * @param maxAttempts Maximum number of polling attempts (default: 60, about 5 minutes)
   * @returns Promise resolving to the final text-to-speech result
   */
  async createAndWaitForTextToSpeech(
    params: TextToSpeech.TextToSpeechParams,
    pollInterval = 5000,
    maxAttempts = 60
  ): Promise<TextToSpeech.TextToSpeechResultResponse> {
    // Create the text-to-speech task
    const response = await this.createTextToSpeech(params);

    // Poll for completion
    let attempts = 0;
    let result = await this.getTextToSpeech(response.id);

    while (attempts < maxAttempts && result.status !== 'done' && result.status !== 'error') {
      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      // Check the status again
      result = await this.getTextToSpeech(response.id);
      attempts++;
    }

    // Check if we reached max attempts without completion
    if (attempts >= maxAttempts && result.status !== 'done' && result.status !== 'error') {
      throw new Error(
        `Text-to-speech task ${response.id} did not complete within the timeout period`
      );
    }

    return result;
  }
}
