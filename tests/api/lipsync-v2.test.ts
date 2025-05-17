import { LipsyncV2Api } from '../../src/api/lipsync-v2';
import {
  mockLipsyncV2CreationResponse,
  mockLipsyncV2Results
} from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LipsyncV2Api', () => {
  let lipsyncV2Api: LipsyncV2Api;
  let mockClient: MockCreatifyApiClient;

  beforeEach(() => {
    // Create a new instance of the LipsyncV2Api with the mock factory
    lipsyncV2Api = new LipsyncV2Api({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    }, mockApiClientFactory);

    // Get the mock client that was created
    mockClient = mockApiClientFactory.getLastCreatedClient() as MockCreatifyApiClient;

    // Reset mock history
    mockClient.reset();
  });

  describe('createLipsyncV2', () => {
    it('should create a lipsync v2 task', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockLipsyncV2CreationResponse);

      const params = {
        video_inputs: [
          {
            character: {
              type: 'avatar' as const,
              avatar_id: 'avatar-123',
              avatar_style: 'normal'
            },
            voice: {
              type: 'text' as const,
              input_text: 'Hello, this is a test',
              voice_id: 'voice-123'
            },
            background: {
              type: 'image' as const,
              url: 'https://example.com/background.jpg'
            }
          }
        ],
        aspect_ratio: '16:9'
      };

      const result = await lipsyncV2Api.createLipsyncV2(params);

      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs_v2/', params);
      expect(result).toEqual(mockLipsyncV2CreationResponse);
    });

    it('should handle errors', async () => {
      // Mock the post method to throw an error
      mockClient.post.mockRejectedValueOnce(new Error('API error'));

      const params = {
        video_inputs: [
          {
            character: {
              type: 'avatar' as const,
              avatar_id: 'avatar-123',
              avatar_style: 'normal'
            },
            voice: {
              type: 'text' as const,
              input_text: 'Hello, this is a test',
              voice_id: 'voice-123'
            },
            background: {
              type: 'image' as const,
              url: 'https://example.com/background.jpg'
            }
          }
        ],
        aspect_ratio: '16:9'
      };

      await expect(lipsyncV2Api.createLipsyncV2(params)).rejects.toThrow('API error');
      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs_v2/', params);
    });
  });

  describe('getLipsyncV2', () => {
    it('should fetch a lipsync v2 task by ID', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockLipsyncV2Results.done);

      const result = await lipsyncV2Api.getLipsyncV2('lipsync-v2-123456');

      expect(mockClient.get).toHaveBeenCalledWith('/api/lipsyncs_v2/lipsync-v2-123456/');
      expect(result).toEqual(mockLipsyncV2Results.done);
    });

    it('should handle errors gracefully', async () => {
      // Mock the get method to throw an error
      mockClient.get.mockRejectedValueOnce(new Error('API error'));

      const result = await lipsyncV2Api.getLipsyncV2('lipsync-v2-123456');

      expect(mockClient.get).toHaveBeenCalledWith('/api/lipsyncs_v2/lipsync-v2-123456/');
      expect(result.status).toBe('error');
      expect(result.error_message).toBe('API error');
    });
  });

  describe('getLipsyncsV2', () => {
    it('should fetch all lipsync v2 tasks', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce([mockLipsyncV2Results.done]);

      const result = await lipsyncV2Api.getLipsyncsV2();

      expect(mockClient.get).toHaveBeenCalledWith('/api/lipsyncs_v2/');
      expect(result).toEqual([mockLipsyncV2Results.done]);
    });

    it('should handle errors gracefully', async () => {
      // Mock the get method to throw an error
      mockClient.get.mockRejectedValueOnce(new Error('API error'));

      const result = await lipsyncV2Api.getLipsyncsV2();

      expect(mockClient.get).toHaveBeenCalledWith('/api/lipsyncs_v2/');
      expect(result).toEqual([]);
    });
  });

  describe('generateLipsyncV2Preview', () => {
    it('should generate a preview of a lipsync v2 video', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockLipsyncV2CreationResponse);

      const result = await lipsyncV2Api.generateLipsyncV2Preview('lipsync-v2-123456');

      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs_v2/lipsync-v2-123456/preview/', {});
      expect(result).toEqual(mockLipsyncV2CreationResponse);
    });
  });

  describe('renderLipsyncV2', () => {
    it('should render a lipsync v2 video', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockLipsyncV2CreationResponse);

      const result = await lipsyncV2Api.renderLipsyncV2('lipsync-v2-123456');

      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs_v2/lipsync-v2-123456/render/', {});
      expect(result).toEqual(mockLipsyncV2CreationResponse);
    });
  });

  describe('createAndWaitForLipsyncV2', () => {
    it('should create a lipsync v2 task and wait for completion', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockLipsyncV2CreationResponse);
      mockClient.get
        .mockResolvedValueOnce(mockLipsyncV2Results.pending)
        .mockResolvedValueOnce(mockLipsyncV2Results.processing)
        .mockResolvedValueOnce(mockLipsyncV2Results.done);

      const params = {
        video_inputs: [
          {
            character: {
              type: 'avatar' as const,
              avatar_id: 'avatar-123',
              avatar_style: 'normal'
            },
            voice: {
              type: 'text' as const,
              input_text: 'Hello, this is a test',
              voice_id: 'voice-123'
            },
            background: {
              type: 'image' as const,
              url: 'https://example.com/background.jpg'
            }
          }
        ],
        aspect_ratio: '16:9'
      };

      const result = await lipsyncV2Api.createAndWaitForLipsyncV2(
        params,
        100, // Poll interval
        5    // Max attempts
      );

      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs_v2/', params);
      expect(mockClient.get).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockLipsyncV2Results.done);
    });

    it('should handle error responses', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockLipsyncV2CreationResponse);
      mockClient.get
        .mockResolvedValueOnce(mockLipsyncV2Results.pending)
        .mockResolvedValueOnce(mockLipsyncV2Results.error);

      const params = {
        video_inputs: [
          {
            character: {
              type: 'avatar' as const,
              avatar_id: 'avatar-123',
              avatar_style: 'normal'
            },
            voice: {
              type: 'text' as const,
              input_text: 'Hello, this is a test',
              voice_id: 'voice-123'
            },
            background: {
              type: 'image' as const,
              url: 'https://example.com/background.jpg'
            }
          }
        ],
        aspect_ratio: '16:9'
      };

      const result = await lipsyncV2Api.createAndWaitForLipsyncV2(
        params,
        100, // Poll interval
        5    // Max attempts
      );

      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs_v2/', params);
      expect(mockClient.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockLipsyncV2Results.error);
    });

    it('should return error status if max attempts is reached', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockLipsyncV2CreationResponse);
      mockClient.get.mockResolvedValue(mockLipsyncV2Results.pending);

      const params = {
        video_inputs: [
          {
            character: {
              type: 'avatar' as const,
              avatar_id: 'avatar-123',
              avatar_style: 'normal'
            },
            voice: {
              type: 'text' as const,
              input_text: 'Hello, this is a test',
              voice_id: 'voice-123'
            },
            background: {
              type: 'image' as const,
              url: 'https://example.com/background.jpg'
            }
          }
        ],
        aspect_ratio: '16:9'
      };

      // Mock timers
      vi.useFakeTimers();

      const promise = lipsyncV2Api.createAndWaitForLipsyncV2(
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

      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs_v2/', params);
      expect(mockClient.get).toHaveBeenCalledTimes(4); // Initial + 3 attempts
    });
  });
});
