import { TextToSpeechApi } from '../api/text-to-speech';
import { TextToSpeech, CreatifyApiOptions } from '../types';

/**
 * Utility class for processing audio with the Creatify Text-to-Speech API
 */
export class AudioProcessor {
  private api: TextToSpeechApi;
  
  /**
   * Create a new AudioProcessor
   * @param apiIdOrOptions API ID or full options object
   * @param apiKey API key (only required if apiIdOrOptions is a string)
   */
  constructor(
    apiIdOrOptions: string | CreatifyApiOptions,
    apiKey?: string
  ) {
    // Handle different constructor argument formats
    const options: CreatifyApiOptions = typeof apiIdOrOptions === 'string'
      ? { apiId: apiIdOrOptions, apiKey: apiKey! }
      : apiIdOrOptions;
      
    this.api = new TextToSpeechApi(options);
  }
  
  /**
   * Generate audio from text
   * @param script Text to convert to speech
   * @param accentId Voice/accent ID to use
   * @param waitForCompletion Whether to wait for the task to complete (default: true)
   * @returns Promise resolving to the audio task result or response
   */
  async generateAudio(
    script: string,
    accentId: string,
    waitForCompletion = true
  ): Promise<TextToSpeech.TextToSpeechResultResponse | TextToSpeech.TextToSpeechResponse> {
    const params: TextToSpeech.TextToSpeechParams = {
      script,
      accent: accentId
    };
    
    if (waitForCompletion) {
      return this.api.createAndWaitForTextToSpeech(params);
    } else {
      return this.api.createTextToSpeech(params);
    }
  }
  
  /**
   * Check the status of an audio generation task
   * @param id ID of the text-to-speech task
   * @returns Promise resolving to the task status and result
   */
  async checkAudioStatus(id: string): Promise<TextToSpeech.TextToSpeechResultResponse> {
    return this.api.getTextToSpeech(id);
  }
  
  /**
   * Poll for audio generation completion
   * @param id ID of the text-to-speech task
   * @param pollInterval Interval in ms between status checks (default: 2000)
   * @param maxAttempts Maximum number of polling attempts (default: 60)
   * @returns Promise resolving to the final task result
   */
  async waitForAudioCompletion(
    id: string,
    pollInterval = 2000,
    maxAttempts = 60
  ): Promise<TextToSpeech.TextToSpeechResultResponse> {
    let attempts = 0;
    let result = await this.api.getTextToSpeech(id);
    
    while (
      attempts < maxAttempts &&
      result.status !== 'done' &&
      result.status !== 'error'
    ) {
      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Check the status again
      result = await this.api.getTextToSpeech(id);
      attempts++;
    }
    
    // Check if we reached max attempts without completion
    if (attempts >= maxAttempts && result.status !== 'done' && result.status !== 'error') {
      throw new Error(`Audio generation task ${id} did not complete within the timeout period`);
    }
    
    return result;
  }
  
  /**
   * List all audio generation tasks
   * @returns Promise resolving to an array of tasks
   */
  async listAudioTasks(): Promise<TextToSpeech.TextToSpeechResultResponse[]> {
    return this.api.getTextToSpeechList();
  }
}