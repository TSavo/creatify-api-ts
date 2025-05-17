import { CreatifyApiClient } from '../client';
import { TextToSpeech } from '../types';

/**
 * Client for interacting with the Creatify Text-to-Speech API
 */
export class TextToSpeechApi extends CreatifyApiClient {
  /**
   * Create a text-to-speech task to convert text into an audio file
   * @param params Parameters for the text-to-speech generation
   * @returns Promise resolving to the text-to-speech task response
   */
  async createTextToSpeech(
    params: TextToSpeech.TextToSpeechParams
  ): Promise<TextToSpeech.TextToSpeechResponse> {
    return this.post<TextToSpeech.TextToSpeechResponse>('/api/text_to_speech/', params);
  }

  /**
   * Get the status and result of a text-to-speech task
   * @param id ID of the text-to-speech task
   * @returns Promise resolving to the text-to-speech task status and result
   */
  async getTextToSpeech(id: string): Promise<TextToSpeech.TextToSpeechResultResponse> {
    return this.get<TextToSpeech.TextToSpeechResultResponse>(`/api/text_to_speech/${id}/`);
  }

  /**
   * Get all text-to-speech tasks
   * @returns Promise resolving to an array of text-to-speech tasks
   */
  async getTextToSpeechList(): Promise<TextToSpeech.TextToSpeechResultResponse[]> {
    return this.get<TextToSpeech.TextToSpeechResultResponse[]>('/api/text_to_speech/');
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
    
    while (
      attempts < maxAttempts &&
      result.status !== 'done' &&
      result.status !== 'error'
    ) {
      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Check the status again
      result = await this.getTextToSpeech(response.id);
      attempts++;
    }
    
    // Check if we reached max attempts without completion
    if (attempts >= maxAttempts && result.status !== 'done' && result.status !== 'error') {
      throw new Error(`Text-to-speech task ${response.id} did not complete within the timeout period`);
    }
    
    return result;
  }
}