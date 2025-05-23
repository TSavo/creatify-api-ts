import { VideoCreator } from '../../src/utils/video-creator';
import { AvatarApi } from '../../src/api/avatar';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions
const mockGetAvatars = vi.fn().mockResolvedValue([
  {
    id: 'test-avatar-id-1',
    avatar_id: 'test-avatar-id-1',
    name: 'John',
  },
  {
    id: 'test-avatar-id-2',
    avatar_id: 'test-avatar-id-2',
    name: 'Emma',
  },
]);

const mockGetVoices = vi.fn().mockResolvedValue([
  {
    voice_id: 'test-voice-id-1',
    name: 'English Male',
  },
  {
    voice_id: 'test-voice-id-2',
    name: 'English Female',
  },
]);

const mockCreateLipsync = vi.fn().mockResolvedValue({
  id: 'test-lipsync-id',
  status: 'pending',
});

const mockGetLipsync = vi.fn().mockResolvedValue({
  id: 'test-lipsync-id',
  status: 'done',
  output: 'https://example.com/video.mp4',
});

const mockCreateMultiAvatarLipsync = vi.fn().mockResolvedValue({
  id: 'test-multi-lipsync-id',
  status: 'pending',
});

// Mock the AvatarApi class directly
vi.mock('../../src/api/avatar', () => {
  return {
    AvatarApi: vi.fn().mockImplementation(() => {
      return {
        getAvatars: mockGetAvatars,
        getVoices: mockGetVoices,
        createLipsync: mockCreateLipsync,
        getLipsync: mockGetLipsync,
        createMultiAvatarLipsync: mockCreateMultiAvatarLipsync,
      };
    }),
  };
});

describe('VideoCreator Direct Mock Test', () => {
  let videoCreator: VideoCreator;
  let mockAvatarApi: any;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset mock implementations
    mockGetAvatars.mockClear();
    mockGetVoices.mockClear();
    mockCreateLipsync.mockClear();
    mockGetLipsync.mockClear();
    mockCreateMultiAvatarLipsync.mockClear();

    // Create a new VideoCreator instance
    videoCreator = new VideoCreator('test-api-id', 'test-api-key');

    // Set up the mock API reference
    mockAvatarApi = {
      getAvatars: mockGetAvatars,
      getVoices: mockGetVoices,
      createLipsync: mockCreateLipsync,
      getLipsync: mockGetLipsync,
      createMultiAvatarLipsync: mockCreateMultiAvatarLipsync,
    };
  });

  describe('constructor', () => {
    it('should initialize with API credentials as separate parameters', () => {
      const creator = new VideoCreator('test-api-id', 'test-api-key');
      expect(creator).toBeDefined();
    });

    it('should initialize with API credentials as an options object', () => {
      const creator = new VideoCreator({
        apiId: 'test-api-id',
        apiKey: 'test-api-key',
      });
      expect(creator).toBeDefined();
    });
  });

  describe('createVideo', () => {
    it('should create a video successfully with direct IDs', async () => {
      // Mock timers to control the polling intervals
      vi.useFakeTimers();

      // Test creating a video with direct IDs
      const resultPromise = videoCreator.createVideo({
        avatarId: 'test-avatar-id-1',
        voiceId: 'test-voice-id-1',
        script: 'Hello world',
        aspectRatio: '16:9',
      });

      // Fast forward time to complete the task
      vi.advanceTimersByTime(5000);

      // Get the final result
      const result = await resultPromise;

      // Verify the createLipsync was called with the correct parameters
      expect(mockAvatarApi.createLipsync).toHaveBeenCalledWith({
        text: 'Hello world',
        creator: 'test-avatar-id-1',
        voice_id: 'test-voice-id-1',
        aspect_ratio: '16:9',
      });

      // Verify the result
      expect(result).toEqual({
        id: 'test-lipsync-id',
        status: 'done',
        url: 'https://example.com/video.mp4',
      });

      // Restore real timers
      vi.useRealTimers();
    });

    it('should find avatar and voice by name', async () => {
      // Mock timers
      vi.useFakeTimers();

      // Test creating a video with names
      const resultPromise = videoCreator.createVideo({
        avatarName: 'John',
        voiceName: 'English Male',
        script: 'Hello world',
      });

      // Fast forward time to complete the task
      vi.advanceTimersByTime(5000);

      // Get the final result
      const result = await resultPromise;

      // Verify that getAvatars and getVoices were called
      expect(mockAvatarApi.getAvatars).toHaveBeenCalled();
      expect(mockAvatarApi.getVoices).toHaveBeenCalled();

      // Verify the createLipsync was called with the correct IDs
      expect(mockAvatarApi.createLipsync).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Hello world',
          creator: 'test-avatar-id-1',
          voice_id: 'test-voice-id-1',
        })
      );

      // Verify the result
      expect(result).toEqual({
        id: 'test-lipsync-id',
        status: 'done',
        url: 'https://example.com/video.mp4',
      });

      // Restore timers
      vi.useRealTimers();
    });

    it('should throw an error if avatar name is not found', async () => {
      // Override the getAvatars mock to return an empty array
      mockAvatarApi.getAvatars.mockResolvedValueOnce([]);

      // Attempt to create a video with a non-existent avatar name
      await expect(
        videoCreator.createVideo({
          avatarName: 'NonExistentAvatar',
          script: 'Hello! This is a test video.',
          aspectRatio: '16:9',
        })
      ).rejects.toThrow('Avatar with name "NonExistentAvatar" not found');
    });

    it('should throw an error if voice name is not found', async () => {
      // Mock successful avatar lookup but failed voice lookup
      mockAvatarApi.getVoices.mockResolvedValueOnce([]);

      // Attempt to create a video with existing avatar but non-existent voice
      await expect(
        videoCreator.createVideo({
          avatarName: 'John',
          voiceName: 'NonExistentVoice',
          script: 'Hello! This is a test video.',
          aspectRatio: '16:9',
        })
      ).rejects.toThrow('Voice with name "NonExistentVoice" not found');
    });

    it('should handle API errors', async () => {
      // Mock createLipsync to throw an error
      mockCreateLipsync.mockRejectedValueOnce(new Error('API error'));

      // Attempt to create a video that will fail due to API error
      await expect(
        videoCreator.createVideo({
          avatarId: 'test-avatar-id-1',
          script: 'Hello! This is a test video.',
          aspectRatio: '16:9',
        })
      ).rejects.toThrow('API error');
    });
  });

  describe('createConversation', () => {
    it('should create a conversation video with avatar IDs', async () => {
      // Mock timers
      vi.useFakeTimers();

      // Test creating a conversation
      const resultPromise = videoCreator.createConversation({
        conversation: [
          {
            avatarId: 'test-avatar-id-1',
            voiceId: 'test-voice-id-1',
            text: 'Hello',
          },
          {
            avatarId: 'test-avatar-id-2',
            voiceId: 'test-voice-id-2',
            text: 'Hi there',
          },
        ],
      });

      // Fast forward time
      vi.advanceTimersByTime(5000);

      // Get the final result
      const result = await resultPromise;

      // Verify that createMultiAvatarLipsync was called
      expect(mockAvatarApi.createMultiAvatarLipsync).toHaveBeenCalled();

      // Verify the structure of the arguments
      expect(mockAvatarApi.createMultiAvatarLipsync).toHaveBeenCalledWith(
        expect.objectContaining({
          video_inputs: expect.any(Array),
          aspect_ratio: expect.any(String),
        })
      );

      // Verify the result
      expect(result).toEqual({
        id: 'test-multi-lipsync-id',
        status: 'done',
        url: 'https://example.com/video.mp4',
      });

      // Restore timers
      vi.useRealTimers();
    });

    it('should create a conversation video with avatar names', async () => {
      // Mock timers
      vi.useFakeTimers();

      // Test creating a conversation with names
      const resultPromise = videoCreator.createConversation({
        conversation: [
          {
            avatarName: 'John',
            voiceName: 'English Male',
            text: 'Hello! How are you?',
          },
          {
            avatarName: 'Emma',
            voiceName: 'English Female',
            text: "I'm doing great, thanks for asking!",
          },
        ],
        backgroundUrl: 'https://example.com/background.jpg',
        aspectRatio: '16:9',
      });

      // Fast forward time
      vi.advanceTimersByTime(5000);

      // Get the final result
      const result = await resultPromise;

      // Verify that getAvatars and getVoices were called for name lookups
      expect(mockAvatarApi.getAvatars).toHaveBeenCalled();
      expect(mockAvatarApi.getVoices).toHaveBeenCalled();

      // Verify that createMultiAvatarLipsync was called
      expect(mockAvatarApi.createMultiAvatarLipsync).toHaveBeenCalled();

      // Verify the result
      expect(result).toEqual({
        id: 'test-multi-lipsync-id',
        status: 'done',
        url: 'https://example.com/video.mp4',
      });

      // Restore timers
      vi.useRealTimers();
    });
  });
});
