import { AiShortsApi } from '../../src/api/ai-shorts';
import { mockAiShortsCreationResponse, mockAiShortsResults } from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AiShortsApi', () => {
  let aiShortsApi: AiShortsApi;
  let mockClient: MockCreatifyApiClient;

  beforeEach(() => {
    // Create a new instance of the AiShortsApi with the mock factory
    aiShortsApi = new AiShortsApi(
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

  describe('createAiShorts', () => {
    it('should create an AI Shorts task', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockAiShortsCreationResponse);

      const params = {
        prompt: 'Create a viral video about technology trends',
        aspect_ratio: '9:16',
      };

      const result = await aiShortsApi.createAiShorts(params);

      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_shorts/', params);
      expect(result).toEqual(mockAiShortsCreationResponse);
    });
  });

  describe('getAiShorts', () => {
    it('should fetch an AI Shorts task by ID', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockAiShortsResults.done);

      const result = await aiShortsApi.getAiShorts('shorts-123456');

      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_shorts/shorts-123456/');
      expect(result).toEqual(mockAiShortsResults.done);
    });

    it('should handle errors gracefully', async () => {
      // Mock the get method to throw an error
      mockClient.get.mockRejectedValueOnce(new Error('API error'));

      const result = await aiShortsApi.getAiShorts('shorts-123456');

      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_shorts/shorts-123456/');
      expect(result.status).toBe('error');
      expect(result.error_message).toBe('API error');
    });
  });

  describe('getAiShortsList', () => {
    it('should fetch all AI Shorts tasks', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce([mockAiShortsResults.done]);

      const result = await aiShortsApi.getAiShortsList();

      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_shorts/');
      expect(result).toEqual([mockAiShortsResults.done]);
    });

    it('should handle errors gracefully', async () => {
      // Mock the get method to throw an error
      mockClient.get.mockRejectedValueOnce(new Error('API error'));

      const result = await aiShortsApi.getAiShortsList();

      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_shorts/');
      expect(result).toEqual([]);
    });
  });

  describe('generateAiShortsPreview', () => {
    it('should generate a preview of an AI Shorts video', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockAiShortsCreationResponse);

      const result = await aiShortsApi.generateAiShortsPreview('shorts-123456');

      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_shorts/shorts-123456/preview/', {});
      expect(result).toEqual(mockAiShortsCreationResponse);
    });
  });

  describe('renderAiShorts', () => {
    it('should render an AI Shorts video', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockAiShortsCreationResponse);

      const result = await aiShortsApi.renderAiShorts('shorts-123456');

      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_shorts/shorts-123456/render/', {});
      expect(result).toEqual(mockAiShortsCreationResponse);
    });
  });

  describe('createAndWaitForAiShorts', () => {
    it('should create an AI Shorts task and wait for completion', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockAiShortsCreationResponse);
      mockClient.get
        .mockResolvedValueOnce(mockAiShortsResults.pending)
        .mockResolvedValueOnce(mockAiShortsResults.processing)
        .mockResolvedValueOnce(mockAiShortsResults.done);

      const params = {
        prompt: 'Create a viral video about technology trends',
        aspect_ratio: '9:16',
      };

      const result = await aiShortsApi.createAndWaitForAiShorts(
        params,
        100, // Poll interval
        5 // Max attempts
      );

      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_shorts/', params);
      expect(mockClient.get).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockAiShortsResults.done);
    });

    it('should handle error responses', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockAiShortsCreationResponse);
      mockClient.get
        .mockResolvedValueOnce(mockAiShortsResults.pending)
        .mockResolvedValueOnce(mockAiShortsResults.error);

      const params = {
        prompt: 'Create a viral video about technology trends',
        aspect_ratio: '9:16',
      };

      const result = await aiShortsApi.createAndWaitForAiShorts(
        params,
        100, // Poll interval
        5 // Max attempts
      );

      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_shorts/', params);
      expect(mockClient.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockAiShortsResults.error);
    });

    it('should return error status if max attempts is reached', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockAiShortsCreationResponse);
      mockClient.get.mockResolvedValue(mockAiShortsResults.pending);

      const params = {
        prompt: 'Create a viral video about technology trends',
        aspect_ratio: '9:16',
      };

      // Mock timers
      vi.useFakeTimers();

      const promise = aiShortsApi.createAndWaitForAiShorts(
        params,
        100, // Poll interval
        3 // Max attempts
      );

      // Fast forward time to complete the polling
      await vi.runAllTimersAsync();

      // Restore real timers
      vi.useRealTimers();

      const result = await promise;

      // Verify we got an error status
      expect(result.status).toBe('error');
      expect(result.error_message).toMatch(/did not complete within the timeout period/);
      expect(result.success).toBe(false);

      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_shorts/', params);
      expect(mockClient.get).toHaveBeenCalledTimes(4); // Initial + 3 attempts
    });
  });
});
