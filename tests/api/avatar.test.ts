import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AvatarApi } from '../../src/api/avatar';
import {
  mockAvatars,
  mockVoices,
  mockLipsyncCreationResponse,
  mockLipsyncResults
} from '../mocks/api-responses';
import { MockCreatifyApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';

describe('AvatarApi', () => {
  let avatarApi: AvatarApi;
  let mockClientFactory: MockCreatifyApiClientFactory;
  let mockClient: MockCreatifyApiClient;

  beforeEach(() => {
    // Create a new factory instance for each test
    mockClientFactory = new MockCreatifyApiClientFactory();

    // Create the API with our mock factory
    avatarApi = new AvatarApi(
      {
        apiId: 'test-api-id',
        apiKey: 'test-api-key'
      },
      mockClientFactory
    );

    // Get the mock client instance that was created
    mockClient = mockClientFactory.getLastCreatedClient() as MockCreatifyApiClient;
  });

  describe('getAvatars', () => {
    it('should fetch available avatars', async () => {
      // Mock the client's get method to return our mock data
      mockClient.get.mockResolvedValueOnce(mockAvatars);

      const result = await avatarApi.getAvatars();

      // Verify the client was called correctly
      expect(mockClient.get).toHaveBeenCalledWith('/api/personas/', undefined);

      // Verify the result contains transformed data with avatar_id property
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          avatar_id: expect.any(String),
          name: expect.any(String)
        })
      ]));
    });
  });

  describe('getVoices', () => {
    it('should fetch available voices', async () => {
      // Mock the client's get method to return our mock data
      mockClient.get.mockResolvedValueOnce(mockVoices);

      const result = await avatarApi.getVoices();

      // Verify the client was called correctly
      expect(mockClient.get).toHaveBeenCalledWith('/api/voices/');

      // Verify the result
      expect(result).toEqual(mockVoices);
    });
  });


  describe('createLipsync', () => {
    it('should create a lipsync video', async () => {
      // Mock the response
      mockClient.post.mockResolvedValueOnce(mockLipsyncCreationResponse);

      const params = {
        text: 'Hello world!',
        creator: mockAvatars[0].avatar_id,
        aspect_ratio: '16:9' as any,
        voice_id: mockVoices[0].voice_id
      };

      const result = await avatarApi.createLipsync(params);

      // Verify the client was called correctly
      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs/', params);

      // Verify the result
      expect(result).toEqual(mockLipsyncCreationResponse);
    });
  });

  describe('getLipsync', () => {
    it('should fetch a lipsync task by ID', async () => {
      // Mock the response
      mockClient.get.mockResolvedValueOnce(mockLipsyncResults.done);

      const result = await avatarApi.getLipsync('lipsync-123456');

      // Verify the client was called correctly
      expect(mockClient.get).toHaveBeenCalledWith('/api/lipsyncs/lipsync-123456/');

      // Verify the result
      expect(result).toEqual(mockLipsyncResults.done);
    });
  });

  describe('getLipsyncs', () => {
    it('should fetch all lipsync tasks', async () => {
      const mockLipsyncList = [mockLipsyncResults.done, mockLipsyncResults.processing];

      // Mock the response
      mockClient.get.mockResolvedValueOnce(mockLipsyncList);

      const result = await avatarApi.getLipsyncs();

      // Verify the client was called correctly
      expect(mockClient.get).toHaveBeenCalledWith('/api/lipsyncs/');

      // Verify the result
      expect(result).toEqual(mockLipsyncList);
    });
  });

  describe('createMultiAvatarLipsync', () => {
    it('should create a multi-avatar lipsync video', async () => {
      // Mock the response
      mockClient.post.mockResolvedValueOnce(mockLipsyncCreationResponse);

      const params = {
        video_inputs: [
          {
            character: {
              type: 'avatar' as const,
              avatar_id: mockAvatars[0].avatar_id,
              avatar_style: 'normal'
            },
            voice: {
              type: 'text' as const,
              input_text: 'Hello from the first avatar!',
              voice_id: mockVoices[0].voice_id
            },
            background: {
              type: 'image' as const,
              url: 'https://example.com/background.jpg'
            }
          },
          {
            character: {
              type: 'avatar' as const,
              avatar_id: mockAvatars[1].avatar_id,
              avatar_style: 'casual'
            },
            voice: {
              type: 'text' as const,
              input_text: 'And hello from the second avatar!',
              voice_id: mockVoices[1].voice_id
            },
            background: {
              type: 'image' as const,
              url: 'https://example.com/background.jpg'
            }
          }
        ],
        aspect_ratio: '16:9' as any
      };

      const result = await avatarApi.createMultiAvatarLipsync(params);

      // Verify the client was called correctly
      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs/multi_avatar/', params);

      // Verify the result
      expect(result).toEqual(mockLipsyncCreationResponse);
    });
  });

  describe('createAndWaitForLipsync', () => {
    it('should create a lipsync and wait for completion', async () => {
      // Mock the responses in sequence
      mockClient.post.mockResolvedValueOnce(mockLipsyncCreationResponse);
      mockClient.get
        .mockResolvedValueOnce(mockLipsyncResults.done); // Return done immediately to avoid timeout

      const params = {
        text: 'Hello world!',
        creator: mockAvatars[0].avatar_id
      };

      // Start the async process with a short polling interval
      const result = await avatarApi.createAndWaitForLipsync(params, 100);

      // Verify the client calls
      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs/', params);
      expect(mockClient.get).toHaveBeenCalledWith('/api/lipsyncs/lipsync-123456/');

      // Final result should be the completed lipsync
      expect(result).toEqual(mockLipsyncResults.done);
    }, 10000); // Increase timeout

    it('should throw an error if max attempts is reached', async () => {
      // Mock the create response and pending status for all get calls
      mockClient.post.mockResolvedValueOnce(mockLipsyncCreationResponse);
      mockClient.get.mockResolvedValue(mockLipsyncResults.pending);

      const params = {
        text: 'Hello world!',
        creator: mockAvatars[0].avatar_id
      };

      // Start the async process with only 2 max attempts and a short polling interval
      const resultPromise = avatarApi.createAndWaitForLipsync(params, 100, 2);

      // Expect the function to throw an error due to timeout
      await expect(resultPromise).rejects.toThrow(/did not complete within the timeout period/);
    }, 10000); // Increase timeout
  });
});
