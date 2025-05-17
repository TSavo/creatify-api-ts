import { CreatifyApiClient } from '../client';
import { Avatar } from '../types';

/**
 * Client for interacting with the Creatify AI Avatar API
 */
export class AvatarApi extends CreatifyApiClient {
  /**
   * Get a list of all available avatars
   * @returns Promise resolving to an array of avatar information
   */
  async getAvatars(): Promise<Avatar.AvatarInfo[]> {
    return this.get<Avatar.AvatarInfo[]>('/api/personas/');
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
}