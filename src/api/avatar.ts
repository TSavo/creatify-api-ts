import { CreatifyApiClient } from '../client';
import { Avatar } from '../types';

/**
 * Client for interacting with the Creatify AI Avatar API
 * @see https://creatify.mintlify.app/api-reference/lipsync
 */
export class AvatarApi extends CreatifyApiClient {
  /**
   * Get a list of all available avatars
   * @returns Promise resolving to an array of avatar information
   * @see https://creatify.mintlify.app/api-reference/personas/get-apipersonas
   */
  async getAvatars(filters?: {
    age_range?: 'child' | 'teen' | 'adult' | 'senior',
    gender?: 'm' | 'f' | 'nb',
    location?: 'outdoor' | 'fantasy' | 'indoor' | 'other',
    style?: 'selfie' | 'presenter' | 'other'
  }): Promise<Avatar.AvatarInfo[]> {
    return this.get<Avatar.AvatarInfo[]>('/api/personas/', filters);
  }

  /**
   * Get a list of available avatars with pagination
   * @param page Page number (starts from 1)
   * @param limit Number of items per page
   * @param filters Optional filtering parameters
   * @returns Promise resolving to paginated avatar information
   * @see https://creatify.mintlify.app/api-reference/personas/get-apipersonas-paginated
   */
  async getAvatarsPaginated(
    page: number = 1,
    limit: number = 20,
    filters?: {
      age_range?: 'child' | 'teen' | 'adult' | 'senior',
      gender?: 'm' | 'f' | 'nb',
      location?: 'outdoor' | 'fantasy' | 'indoor' | 'other',
      style?: 'selfie' | 'presenter' | 'other'
    }
  ): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Avatar.AvatarInfo[];
  }> {
    return this.get('/api/personas-paginated/', {
      page,
      limit,
      ...filters
    });
  }

  /**
   * Get a list of all available voices
   * @returns Promise resolving to an array of voice information
   */
  async getVoices(): Promise<Avatar.VoiceInfo[]> {
    return this.get<Avatar.VoiceInfo[]>('/api/voices/');
  }

  /**
   * Create a lipsync video with an AI avatar speaking the provided text
   * @param params Parameters for the lipsync video generation
   * @returns Promise resolving to the lipsync task response
   */
  async createLipsync(params: Avatar.LipsyncParams): Promise<Avatar.LipsyncResponse> {
    return this.post<Avatar.LipsyncResponse>('/api/lipsyncs/', params);
  }

  /**
   * Get the status and result of a lipsync task
   * @param id ID of the lipsync task
   * @returns Promise resolving to the lipsync task status and result
   */
  async getLipsync(id: string): Promise<Avatar.LipsyncResultResponse> {
    return this.get<Avatar.LipsyncResultResponse>(`/api/lipsyncs/${id}/`);
  }

  /**
   * Get all lipsync tasks
   * @returns Promise resolving to an array of lipsync tasks
   */
  async getLipsyncs(): Promise<Avatar.LipsyncResultResponse[]> {
    return this.get<Avatar.LipsyncResultResponse[]>('/api/lipsyncs/');
  }

  /**
   * Create a multi-avatar lipsync video with multiple AI avatars speaking
   * @param params Parameters for the multi-avatar lipsync video generation
   * @returns Promise resolving to the lipsync task response
   */
  async createMultiAvatarLipsync(
    params: Avatar.MultiAvatarLipsyncParams
  ): Promise<Avatar.LipsyncResponse> {
    return this.post<Avatar.LipsyncResponse>('/api/lipsyncs/multi_avatar/', params);
  }

  /**
   * Create a lipsync video and wait for it to complete
   * @param params Parameters for the lipsync video generation
   * @param pollInterval How often to check status in ms (default 2000)
   * @param maxAttempts Maximum number of polling attempts (default 30)
   * @returns Promise resolving to the completed lipsync task
   */
  async createAndWaitForLipsync(
    params: Avatar.LipsyncParams,
    pollInterval: number = 2000,
    maxAttempts: number = 30
  ): Promise<Avatar.LipsyncResultResponse> {
    // Create the lipsync task
    const response = await this.createLipsync(params);
    
    // Poll for completion
    let attempts = 0;
    let result = await this.getLipsync(response.id);
    
    while (
      attempts < maxAttempts &&
      result.status !== 'done' &&
      result.status !== 'error'
    ) {
      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Check the status again
      result = await this.getLipsync(response.id);
      attempts++;
    }
    
    // Check if we reached max attempts without completion
    if (attempts >= maxAttempts && result.status !== 'done' && result.status !== 'error') {
      throw new Error(`Lipsync task ${response.id} did not complete within the timeout period`);
    }
    
    return result;
  }
}