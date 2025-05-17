import { VideoCreator } from '../../src/utils/video-creator';
import { 
  mockAvatars, 
  mockVoices, 
  mockLipsyncCreationResponse, 
  mockLipsyncResults 
} from '../mocks/api-responses';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockApiClientFactory } from '../mocks/mock-api-client';

/**
 * NOTE: This test file uses a legacy approach to testing the VideoCreator class
 * by mocking the client factory. For a more reliable and maintainable approach,
 * see the video-creator-direct-mock.test.ts file, which directly mocks the AvatarApi class.
 * 
 * This file is kept for reference, but new tests should be added to the direct mock approach.
 */
describe('VideoCreator', () => {
  let videoCreator: VideoCreator;
  let mockClient: any;
  
  beforeEach(() => {
    // Reset mock history
    mockClient = mockApiClientFactory.getLastCreatedClient();
    if (mockClient) {
      mockClient.reset();
    }
    
    // Set up default mock behaviors
    mockClient = mockApiClientFactory.createClient({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    });
    
    // Setup standard mock responses
    mockClient.get.mockImplementation((endpoint: string) => {
      if (endpoint === '/api/personas/') {
        return Promise.resolve([
          {
            avatar_id: '7350375b-9a98-51b8-934d-14d46a645dc2',
            id: '7350375b-9a98-51b8-934d-14d46a645dc2',
            name: 'John',
            gender: 'm',
            age_range: 'adult'
          },
          {
            avatar_id: '18fccce8-86e7-5f31-abc8-18915cb872be',
            id: '18fccce8-86e7-5f31-abc8-18915cb872be',
            name: 'Emma',
            gender: 'f',
            age_range: 'adult'
          }
        ]);
      }
      if (endpoint === '/api/voices/') {
        return Promise.resolve([
          {
            voice_id: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
            name: 'English Male',
            language: 'en',
            gender: 'male'
          },
          {
            voice_id: '360ab221-d951-413b-ba1a-7037dc67da16',
            name: 'English Female',
            language: 'en',
            gender: 'female'
          }
        ]);
      }
      if (endpoint.startsWith('/api/lipsyncs/')) {
        return Promise.resolve({
          id: 'lipsync-123456',
          status: 'done',
          output: 'https://example.com/videos/lipsync-123456.mp4'
        });
      }
      return Promise.resolve({});
    });
    
    mockClient.post.mockImplementation((endpoint: string) => {
      if (endpoint === '/api/lipsyncs/' || endpoint === '/api/lipsyncs/multi_avatar/') {
        return Promise.resolve({
          id: 'lipsync-123456',
          status: 'pending'
        });
      }
      return Promise.resolve({});
    });
    
    // Create VideoCreator with mock client factory
    videoCreator = new VideoCreator('test-api-id', 'test-api-key', mockApiClientFactory);
  });
  
  describe('constructor', () => {
    it('should initialize with API credentials as separate parameters', () => {
      const creator = new VideoCreator('test-api-id', 'test-api-key', mockApiClientFactory);
      expect(creator).toBeDefined();
    });
    
    it('should initialize with API credentials as an options object', () => {
      const creator = new VideoCreator({
        apiId: 'test-api-id',
        apiKey: 'test-api-key'
      }, undefined, mockApiClientFactory);
      expect(creator).toBeDefined();
    });
  });
  
  describe('createVideo', () => {
    it('should create a video with avatar ID and voice ID', async () => {
      // Mock timers
      vi.useFakeTimers();
      
      // Create a video with specific avatar and voice IDs
      const resultPromise = videoCreator.createVideo({
        avatarId: '7350375b-9a98-51b8-934d-14d46a645dc2',
        voiceId: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
        script: 'Hello! This is a test video created with the Creatify API.',
        aspectRatio: '16:9'
      });
      
      // Fast forward time to complete the task
      vi.advanceTimersByTime(5000);
      
      // Get the final result
      const result = await resultPromise;
      
      // Verify the mock calls
      expect(mockClient.post).toHaveBeenCalledTimes(1);
      
      // First call should create the lipsync task
      expect(mockClient.post).toHaveBeenNthCalledWith(
        1,
        '/api/lipsyncs/',
        {
          text: 'Hello! This is a test video created with the Creatify API.',
          creator: '7350375b-9a98-51b8-934d-14d46a645dc2',
          voice_id: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
          aspect_ratio: '16:9'
        }
      );
      
      // Verify the result
      expect(result).toEqual({
        id: 'lipsync-123456',
        status: 'done',
        url: 'https://example.com/videos/lipsync-123456.mp4'
      });
      
      // Restore timers
      vi.useRealTimers();
    });
    
    it('should find avatar and voice by name', async () => {
      // Setup mock avatar response
      mockClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/api/personas/') {
          return Promise.resolve([
            {
              avatar_id: '7350375b-9a98-51b8-934d-14d46a645dc2',
              id: '7350375b-9a98-51b8-934d-14d46a645dc2',
              name: 'John',
              gender: 'm',
              age_range: 'adult'
            },
            {
              avatar_id: '18fccce8-86e7-5f31-abc8-18915cb872be',
              id: '18fccce8-86e7-5f31-abc8-18915cb872be',
              name: 'Emma',
              gender: 'f',
              age_range: 'adult'
            }
          ]);
        }
        if (endpoint === '/api/voices/') {
          return Promise.resolve([
            {
              voice_id: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
              name: 'English Male',
              language: 'en',
              gender: 'male'
            },
            {
              voice_id: '360ab221-d951-413b-ba1a-7037dc67da16',
              name: 'English Female',
              language: 'en',
              gender: 'female'
            }
          ]);
        }
        if (endpoint.startsWith('/api/lipsyncs/')) {
          return Promise.resolve(mockLipsyncResults.done);
        }
        return Promise.resolve({});
      });
      
      // Mock timers
      vi.useFakeTimers();
      
      // Create a video with avatar and voice names
      const resultPromise = videoCreator.createVideo({
        avatarName: 'John',
        voiceName: 'English Male',
        script: 'Hello! This is a test video created with the Creatify API.',
        aspectRatio: '16:9'
      });
      
      // Fast forward time to complete the task
      vi.advanceTimersByTime(5000);
      
      // Get the final result
      const result = await resultPromise;
      
      // Verify the fetch calls
      expect(mockClient.get).toHaveBeenCalledTimes(3);
      
      // First call should get the list of avatars
      expect(mockClient.get).toHaveBeenNthCalledWith(
        1,
        '/api/personas/'
      );
      
      // Second call should get the list of voices
      expect(mockClient.get).toHaveBeenNthCalledWith(
        2,
        '/api/voices/'
      );
      
      // Third call should check the lipsync status
      expect(mockClient.get).toHaveBeenNthCalledWith(
        3,
        '/api/lipsyncs/lipsync-123456/'
      );
      
      // Verify the post call to create the lipsync
      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/lipsyncs/',
        {
          text: 'Hello! This is a test video created with the Creatify API.',
          creator: '7350375b-9a98-51b8-934d-14d46a645dc2',
          voice_id: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
          aspect_ratio: '16:9'
        }
      );
      
      // Verify the result
      expect(result).toEqual({
        id: 'lipsync-123456',
        status: 'done',
        url: 'https://example.com/videos/lipsync-123456.mp4'
      });
      
      // Restore timers
      vi.useRealTimers();
    });
    
    it('should throw an error if avatar name is not found', async () => {
      // Create a video with a non-existent avatar name after preloading the avatars
      await videoCreator.loadAvatars();
      
      await expect(videoCreator.createVideo({
        avatarName: 'NonExistentAvatar',
        script: 'Hello! This is a test video.',
        aspectRatio: '16:9'
      })).rejects.toThrow('Avatar with name "NonExistentAvatar" not found');
    });
    
    it('should throw an error if voice name is not found', async () => {
      // Preload avatars and voices first
      await videoCreator.loadAvatars();
      await videoCreator.loadVoices();
      
      // Create a video with a non-existent voice name
      await expect(videoCreator.createVideo({
        avatarName: 'John',
        voiceName: 'NonExistentVoice',
        script: 'Hello! This is a test video.',
        aspectRatio: '16:9'
      })).rejects.toThrow('Voice with name "NonExistentVoice" not found');
    });
    
    it('should handle API errors', async () => {
      // Mock API call to throw an error
      mockClient.post.mockImplementationOnce(() => {
        throw new Error('API error');
      });
      
      // We need to mock loadAvatars to prevent it from failing before the post request
      videoCreator.loadAvatars = vi.fn().mockResolvedValue([{
        avatar_id: '7350375b-9a98-51b8-934d-14d46a645dc2',
        id: '7350375b-9a98-51b8-934d-14d46a645dc2',
        name: 'John'
      }]);
      
      // Create a video that will fail due to API error
      await expect(videoCreator.createVideo({
        avatarId: '7350375b-9a98-51b8-934d-14d46a645dc2',
        script: 'Hello! This is a test video.',
        aspectRatio: '16:9'
      })).rejects.toThrow('API error');
    });
  });
  
  describe('Advanced video creation', () => {
    it('should create a video with multiple avatars', async () => {
      // Mock API calls for multi-avatar video creation
      mockClient.post.mockImplementation((endpoint: string) => {
        if (endpoint === '/api/lipsyncs/multi_avatar/') {
          return Promise.resolve(mockLipsyncCreationResponse);
        }
        return Promise.resolve({});
      });
      
      // Mock timers
      vi.useFakeTimers();
      
      // Create a multi-avatar video using the existing createConversation method
      const resultPromise = videoCreator.createConversation({
        conversation: [
          {
            avatarId: '7350375b-9a98-51b8-934d-14d46a645dc2',
            voiceId: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
            text: 'Hello from the first avatar!'
          },
          {
            avatarId: '18fccce8-86e7-5f31-abc8-18915cb872be',
            voiceId: '360ab221-d951-413b-ba1a-7037dc67da16',
            text: 'And hello from the second avatar!'
          }
        ],
        backgroundUrl: 'https://example.com/background.jpg',
        aspectRatio: '16:9'
      });
      
      // Fast forward time to complete the task
      vi.advanceTimersByTime(5000);
      
      // Get the final result
      const result = await resultPromise;
      
      // Verify the mock calls
      expect(mockClient.post).toHaveBeenCalledTimes(1);
      
      // Verify the result
      expect(result).toEqual({
        id: 'lipsync-123456',
        status: 'done',
        url: 'https://example.com/videos/lipsync-123456.mp4'
      });
      
      // Restore timers
      vi.useRealTimers();
    });
  });
  
  describe('createConversation', () => {
    it('should create a conversation video with multiple avatars', async () => {
      // Mock API calls for avatar lookup and video creation
      mockClient.get.mockImplementation((endpoint: string) => {
        if (endpoint === '/api/personas/') {
          return Promise.resolve([
            {
              avatar_id: '7350375b-9a98-51b8-934d-14d46a645dc2',
              id: '7350375b-9a98-51b8-934d-14d46a645dc2',
              name: 'John',
              gender: 'm',
              age_range: 'adult'
            },
            {
              avatar_id: '18fccce8-86e7-5f31-abc8-18915cb872be',
              id: '18fccce8-86e7-5f31-abc8-18915cb872be',
              name: 'Emma',
              gender: 'f',
              age_range: 'adult'
            }
          ]);
        }
        if (endpoint === '/api/voices/') {
          return Promise.resolve([
            {
              voice_id: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
              name: 'English Male',
              language: 'en',
              gender: 'male'
            },
            {
              voice_id: '360ab221-d951-413b-ba1a-7037dc67da16',
              name: 'English Female',
              language: 'en',
              gender: 'female'
            }
          ]);
        }
        if (endpoint.startsWith('/api/lipsyncs/')) {
          return Promise.resolve(mockLipsyncResults.done);
        }
        return Promise.resolve({});
      });
      
      // Mock timers
      vi.useFakeTimers();
      
      // Create a conversation video
      const resultPromise = videoCreator.createConversation({
        conversation: [
          {
            avatarName: 'John',
            voiceName: 'English Male',
            text: 'Hello! How are you today?'
          },
          {
            avatarName: 'Emma',
            voiceName: 'English Female',
            text: 'I\'m doing great, thanks for asking!'
          }
        ],
        backgroundUrl: 'https://example.com/background.jpg',
        aspectRatio: '16:9'
      });
      
      // Fast forward time to complete the task
      vi.advanceTimersByTime(5000);
      
      // Get the final result
      const result = await resultPromise;
      
      // Verify the mock calls
      expect(mockClient.get).toHaveBeenCalledTimes(5); // 2 avatar lookups, 2 voice lookups, 1 status check
      
      // Verify the post call for the multi-avatar lipsync
      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith('/api/lipsyncs/multi_avatar/', expect.objectContaining({
        video_inputs: expect.any(Array),
        aspect_ratio: '16:9'
      }));
      
      // Verify the result
      expect(result).toEqual({
        id: 'lipsync-123456',
        status: 'done',
        url: 'https://example.com/videos/lipsync-123456.mp4'
      });
      
      // Restore timers
      vi.useRealTimers();
    });
  });
});
