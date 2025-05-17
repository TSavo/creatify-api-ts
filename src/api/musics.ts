import { CreatifyApiOptions } from '../types';
import { Musics } from '../types';
import { ICreatifyApiClient } from '../types/api-client';
import { apiClientFactory } from '../client-factory';

/**
 * Client for interacting with the Creatify Musics API
 * @see https://creatify.mintlify.app/api-reference/musics
 */
export class MusicsApi {
  private client: ICreatifyApiClient;

  /**
   * Create a new MusicsApi instance
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
   * Get a list of all available music categories
   * @returns Promise resolving to an array of music categories
   * @see https://creatify.mintlify.app/api-reference/musics/get-api-music-categories
   */
  async getMusicCategories(): Promise<Musics.MusicCategory[]> {
    try {
      const categories = await this.client.get<Musics.MusicCategory[]>('/api/music_categories/');
      
      // Ensure categories is an array
      if (!Array.isArray(categories)) {
        return [];
      }
      
      return categories;
    } catch (error) {
      console.error('Error fetching music categories:', error);
      return [];
    }
  }

  /**
   * Get a list of all available music tracks
   * @param category Optional category to filter by
   * @returns Promise resolving to an array of music tracks
   * @see https://creatify.mintlify.app/api-reference/musics/get-api-musics
   */
  async getMusics(category?: string): Promise<Musics.MusicTrack[]> {
    try {
      const params = category ? { category } : undefined;
      const tracks = await this.client.get<Musics.MusicTrack[]>('/api/musics/', params);
      
      // Ensure tracks is an array
      if (!Array.isArray(tracks)) {
        return [];
      }
      
      return tracks;
    } catch (error) {
      console.error('Error fetching music tracks:', error);
      return [];
    }
  }
}
