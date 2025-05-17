import { VideoCreator } from '../../src/utils/video-creator';
import { 
  mockAvatars, 
  mockVoices, 
  mockLipsyncCreationResponse, 
  mockLipsyncResults 
} from '../mocks/api-responses';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch for testing
global.fetch = vi.fn();

// Create a mock Response
const mockJsonPromise = (data: any) => Promise.resolve(data);
const mockFetchPromise = (data: any, status = 200) => 
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => mockJsonPromise(data)
  } as Response);

describe('VideoCreator', () => {
  let videoCreator: VideoCreator;
  
  beforeEach(() => {
    videoCreator = new VideoCreator('test-api-id', 'test-api-key');
    
    // Clear mock history
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  });
  
  describe('constructor', () => {
    it('should initialize with API credentials as separate parameters', () => {
      const creator = new VideoCreator('test-api-id', 'test-api-key');
      expect(creator).toBeDefined();
    });
    
    it('should initialize with API credentials as an options object', () => {
      const creator = new VideoCreator({
        apiId: 'test-api-id',
        apiKey: 'test-api-key'
      });
      expect(creator).toBeDefined();
    });
  });
  
  describe('createVideo', () => {
    it('should create a video with avatar ID and voice ID', async () => {
      // Mock API calls for avatar video creation
      (global.fetch as ReturnType<typeof vi.fn>)
        // Create lipsync task
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncCreationResponse))
        // Check status
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncResults.done));
      
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
      
      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // First call should create the lipsync task
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.creatify.ai/api/lipsync/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            text: 'Hello! This is a test video created with the Creatify API.',
            creator: '7350375b-9a98-51b8-934d-14d46a645dc2',
            voice_id: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
            aspect_ratio: '16:9'
          })
        })
      );
      
      // Second call should check the status
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.creatify.ai/api/lipsync/lipsync-123456/',
        expect.objectContaining({
          method: 'GET'
        })
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
      // Mock API calls for avatar and voice lookup and video creation
      (global.fetch as ReturnType<typeof vi.fn>)
        // Get avatars
        .mockImplementationOnce(() => mockFetchPromise(mockAvatars))
        // Get voices
        .mockImplementationOnce(() => mockFetchPromise(mockVoices))
        // Create lipsync task
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncCreationResponse))
        // Check status
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncResults.done));
      
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
      expect(global.fetch).toHaveBeenCalledTimes(4);
      
      // First call should get the list of avatars
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.creatify.ai/api/creators/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      // Second call should get the list of voices
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.creatify.ai/api/voices/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      // Third call should create the lipsync task with the found avatar and voice IDs
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        'https://api.creatify.ai/api/lipsync/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            text: 'Hello! This is a test video created with the Creatify API.',
            creator: '7350375b-9a98-51b8-934d-14d46a645dc2',
            voice_id: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
            aspect_ratio: '16:9'
          })
        })
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
      // Mock API call to get avatars
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockImplementationOnce(() => mockFetchPromise(mockAvatars));
      
      // Create a video with a non-existent avatar name
      await expect(videoCreator.createVideo({
        avatarName: 'NonExistentAvatar',
        script: 'Hello! This is a test video.',
        aspectRatio: '16:9'
      })).rejects.toThrow('Avatar with name "NonExistentAvatar" not found');
    });
    
    it('should throw an error if voice name is not found', async () => {
      // Mock API calls for avatar lookup
      (global.fetch as ReturnType<typeof vi.fn>)
        // Get avatars
        .mockImplementationOnce(() => mockFetchPromise(mockAvatars))
        // Get voices
        .mockImplementationOnce(() => mockFetchPromise(mockVoices));
      
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
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockImplementationOnce(() => Promise.reject(new Error('API error')));
      
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
      (global.fetch as ReturnType<typeof vi.fn>)
        // Create multi-avatar lipsync task
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncCreationResponse))
        // Check status
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncResults.done));
      
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
      
      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
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
      (global.fetch as ReturnType<typeof vi.fn>)
        // Get avatars (for first avatar lookup)
        .mockImplementationOnce(() => mockFetchPromise(mockAvatars))
        // Get voices (for first voice lookup)
        .mockImplementationOnce(() => mockFetchPromise(mockVoices))
        // Get avatars (for second avatar lookup)
        .mockImplementationOnce(() => mockFetchPromise(mockAvatars))
        // Get voices (for second voice lookup)
        .mockImplementationOnce(() => mockFetchPromise(mockVoices))
        // Create multi-avatar lipsync task
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncCreationResponse))
        // Check status
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncResults.done));
      
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
      
      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(6);
      
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
