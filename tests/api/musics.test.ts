import { MusicsApi } from '../../src/api/musics';
import { mockMusicCategories, mockMusicTracks } from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach } from 'vitest';

describe('MusicsApi', () => {
  let musicsApi: MusicsApi;
  let mockClient: MockCreatifyApiClient;

  beforeEach(() => {
    // Create a new instance of the MusicsApi with the mock factory
    musicsApi = new MusicsApi(
      {
        apiId: 'test-api-id',
        apiKey: 'test-api-key',
      },
      mockApiClientFactory
    );

    // Get the mock client that was created
    mockClient = mockApiClientFactory.getLastCreatedClient() as MockCreatifyApiClient;

    // Reset mock history
    mockClient.reset();
  });

  describe('getMusicCategories', () => {
    it('should fetch music categories', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockMusicCategories);

      const result = await musicsApi.getMusicCategories();

      expect(mockClient.get).toHaveBeenCalledWith('/api/music_categories/');
      expect(result).toEqual(mockMusicCategories);
    });

    it('should handle non-array responses', async () => {
      // Mock the get method to return a non-array response
      mockClient.get.mockResolvedValueOnce({} as any);

      const result = await musicsApi.getMusicCategories();

      expect(mockClient.get).toHaveBeenCalledWith('/api/music_categories/');
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      // Mock the get method to throw an error
      mockClient.get.mockRejectedValueOnce(new Error('API error'));

      const result = await musicsApi.getMusicCategories();

      expect(mockClient.get).toHaveBeenCalledWith('/api/music_categories/');
      expect(result).toEqual([]);
    });
  });

  describe('getMusics', () => {
    it('should fetch music tracks without category filter', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockMusicTracks);

      const result = await musicsApi.getMusics();

      expect(mockClient.get).toHaveBeenCalledWith('/api/musics/', undefined);
      expect(result).toEqual(mockMusicTracks);
    });

    it('should fetch music tracks with category filter', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce([mockMusicTracks[0]]);

      const result = await musicsApi.getMusics('Ambient');

      expect(mockClient.get).toHaveBeenCalledWith('/api/musics/', { category: 'Ambient' });
      expect(result).toEqual([mockMusicTracks[0]]);
    });

    it('should handle non-array responses', async () => {
      // Mock the get method to return a non-array response
      mockClient.get.mockResolvedValueOnce({} as any);

      const result = await musicsApi.getMusics();

      expect(mockClient.get).toHaveBeenCalledWith('/api/musics/', undefined);
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      // Mock the get method to throw an error
      mockClient.get.mockRejectedValueOnce(new Error('API error'));

      const result = await musicsApi.getMusics();

      expect(mockClient.get).toHaveBeenCalledWith('/api/musics/', undefined);
      expect(result).toEqual([]);
    });
  });
});
