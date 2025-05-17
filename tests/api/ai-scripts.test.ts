import { AiScriptsApi } from '../../src/api/ai-scripts';
import {
  mockAiScriptsCreationResponse,
  mockAiScriptsResults
} from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AiScriptsApi', () => {
  let aiScriptsApi: AiScriptsApi;
  let mockClient: MockCreatifyApiClient;

  beforeEach(() => {
    // Create a new instance of the AiScriptsApi with the mock factory
    aiScriptsApi = new AiScriptsApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    }, mockApiClientFactory);

    // Get the mock client that was created
    mockClient = mockApiClientFactory.getLastCreatedClient() as MockCreatifyApiClient;

    // Reset mock history
    mockClient.reset();
  });

  describe('createAiScript', () => {
    it('should create an AI Script task', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockAiScriptsCreationResponse);

      const params = {
        prompt: 'Write a script about technology trends'
      };

      const result = await aiScriptsApi.createAiScript(params);

      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_scripts/', params);
      expect(result).toEqual(mockAiScriptsCreationResponse);
    });
  });

  describe('getAiScript', () => {
    it('should fetch an AI Script task by ID', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockAiScriptsResults.done);

      const result = await aiScriptsApi.getAiScript('script-123456');

      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_scripts/script-123456/');
      expect(result).toEqual(mockAiScriptsResults.done);
    });

    it('should handle errors gracefully', async () => {
      // Mock the get method to throw an error
      mockClient.get.mockRejectedValueOnce(new Error('API error'));

      const result = await aiScriptsApi.getAiScript('script-123456');

      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_scripts/script-123456/');
      expect(result.status).toBe('error');
      expect(result.error_message).toBe('API error');
    });
  });

  describe('getAiScriptsList', () => {
    it('should fetch all AI Script tasks', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce([mockAiScriptsResults.done]);

      const result = await aiScriptsApi.getAiScriptsList();

      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_scripts/');
      expect(result).toEqual([mockAiScriptsResults.done]);
    });

    it('should handle errors gracefully', async () => {
      // Mock the get method to throw an error
      mockClient.get.mockRejectedValueOnce(new Error('API error'));

      const result = await aiScriptsApi.getAiScriptsList();

      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_scripts/');
      expect(result).toEqual([]);
    });
  });

  describe('createAndWaitForAiScript', () => {
    it('should create an AI Script task and wait for completion', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockAiScriptsCreationResponse);
      mockClient.get
        .mockResolvedValueOnce(mockAiScriptsResults.pending)
        .mockResolvedValueOnce(mockAiScriptsResults.processing)
        .mockResolvedValueOnce(mockAiScriptsResults.done);

      const params = {
        prompt: 'Write a script about technology trends'
      };

      const result = await aiScriptsApi.createAndWaitForAiScript(
        params,
        100, // Poll interval
        5    // Max attempts
      );

      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_scripts/', params);
      expect(mockClient.get).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockAiScriptsResults.done);
    });

    it('should handle error responses', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockAiScriptsCreationResponse);
      mockClient.get
        .mockResolvedValueOnce(mockAiScriptsResults.pending)
        .mockResolvedValueOnce(mockAiScriptsResults.error);

      const params = {
        prompt: 'Write a script about technology trends'
      };

      const result = await aiScriptsApi.createAndWaitForAiScript(
        params,
        100, // Poll interval
        5    // Max attempts
      );

      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_scripts/', params);
      expect(mockClient.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockAiScriptsResults.error);
    });

    it('should return error status if max attempts is reached', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockAiScriptsCreationResponse);
      mockClient.get.mockResolvedValue(mockAiScriptsResults.pending);

      const params = {
        prompt: 'Write a script about technology trends'
      };

      // Mock timers
      vi.useFakeTimers();

      const promise = aiScriptsApi.createAndWaitForAiScript(
        params,
        100, // Poll interval
        3    // Max attempts
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

      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_scripts/', params);
      expect(mockClient.get).toHaveBeenCalledTimes(4); // Initial + 3 attempts
    });
  });
});
