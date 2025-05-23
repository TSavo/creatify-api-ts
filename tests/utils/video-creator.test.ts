import { VideoCreator } from '../../src/utils/video-creator';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Create mock functions
const mockGetAvatars = vi.fn().mockResolvedValue([
  {
    avatar_id: '7350375b-9a98-51b8-934d-14d46a645dc2',
    id: '7350375b-9a98-51b8-934d-14d46a645dc2',
    name: 'John',
    gender: 'm',
    age_range: 'adult',
  },
  {
    avatar_id: '18fccce8-86e7-5f31-abc8-18915cb872be',
    id: '18fccce8-86e7-5f31-abc8-18915cb872be',
    name: 'Emma',
    gender: 'f',
    age_range: 'adult',
  },
]);

const mockGetVoices = vi.fn().mockResolvedValue([
  {
    voice_id: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
    name: 'English Male',
    language: 'en',
    gender: 'male',
  },
  {
    voice_id: '360ab221-d951-413b-ba1a-7037dc67da16',
    name: 'English Female',
    language: 'en',
    gender: 'female',
  },
]);

const mockCreateLipsync = vi.fn().mockResolvedValue({
  id: 'lipsync-123456',
  status: 'pending',
});

const mockGetLipsync = vi.fn().mockResolvedValue({
  id: 'lipsync-123456',
  status: 'done',
  output: 'https://example.com/videos/lipsync-123456.mp4',
});

const mockCreateMultiAvatarLipsync = vi.fn().mockResolvedValue({
  id: 'lipsync-123456',
  status: 'pending',
});

// Set up the mock for AvatarApi
vi.mock('../../src/api/avatar', () => {
  return {
    AvatarApi: vi.fn().mockImplementation(() => ({
      getAvatars: mockGetAvatars,
      getVoices: mockGetVoices,
      createLipsync: mockCreateLipsync,
      getLipsync: mockGetLipsync,
      createMultiAvatarLipsync: mockCreateMultiAvatarLipsync,
    })),
  };
});

describe('VideoCreator', () => {
  let videoCreator: VideoCreator;
  let mockAvatarApi: any;

  beforeEach(() => {
    // Reset all mocks
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
    it('should create a video with avatar ID and voice ID', async () => {
      // Mock timers to control the polling intervals
      vi.useFakeTimers();

      // Start creating a video with an avatar ID and voice ID
      const resultPromise = videoCreator.createVideo({
        avatarId: '7350375b-9a98-51b8-934d-14d46a645dc2',
        voiceId: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
        script: 'Hello! This is a test video created with the Creatify API.',
        aspectRatio: '16:9',
      });

      // Advance the timer to simulate waiting for the video to complete
      vi.advanceTimersByTime(5000);

      // Get the result
      const result = await resultPromise;

      // Verify the createLipsync was called with the correct parameters
      expect(mockAvatarApi.createLipsync).toHaveBeenCalledWith({
        text: 'Hello! This is a test video created with the Creatify API.',
        creator: '7350375b-9a98-51b8-934d-14d46a645dc2',
        voice_id: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
        aspect_ratio: '16:9',
      });

      // Verify the result structure
      expect(result).toEqual({
        id: 'lipsync-123456',
        status: 'done',
        url: 'https://example.com/videos/lipsync-123456.mp4',
      });

      // Restore real timers
      vi.useRealTimers();
    });

    it('should find avatar and voice by name', async () => {
      // Mock timers for polling
      vi.useFakeTimers();

      // Create a video with avatar and voice names rather than IDs
      const resultPromise = videoCreator.createVideo({
        avatarName: 'John',
        voiceName: 'English Male',
        script: 'Hello! This is a test video.',
        aspectRatio: '16:9',
      });

      // Fast forward the timer
      vi.advanceTimersByTime(5000);

      // Get the result
      const result = await resultPromise;

      // Verify that getAvatars and getVoices were called
      expect(mockAvatarApi.getAvatars).toHaveBeenCalled();
      expect(mockAvatarApi.getVoices).toHaveBeenCalled();

      // Verify the createLipsync was called with the resolved IDs
      expect(mockAvatarApi.createLipsync).toHaveBeenCalledWith({
        text: 'Hello! This is a test video.',
        creator: '7350375b-9a98-51b8-934d-14d46a645dc2',
        voice_id: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
        aspect_ratio: '16:9',
      });

      // Verify the result structure
      expect(result).toEqual({
        id: 'lipsync-123456',
        status: 'done',
        url: 'https://example.com/videos/lipsync-123456.mp4',
      });

      // Restore real timers
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
          avatarId: '7350375b-9a98-51b8-934d-14d46a645dc2',
          script: 'Hello! This is a test video.',
          aspectRatio: '16:9',
        })
      ).rejects.toThrow('API error');
    });
  });

  describe('createConversation', () => {
    it('should create a conversation with multiple avatars', async () => {
      // Mock timers for polling
      vi.useFakeTimers();

      // Create a conversation video with multiple avatars using IDs
      const resultPromise = videoCreator.createConversation({
        conversation: [
          {
            avatarId: '7350375b-9a98-51b8-934d-14d46a645dc2',
            voiceId: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
            text: 'Hello from the first avatar!',
          },
          {
            avatarId: '18fccce8-86e7-5f31-abc8-18915cb872be',
            voiceId: '360ab221-d951-413b-ba1a-7037dc67da16',
            text: 'And hello from the second avatar!',
          },
        ],
        backgroundUrl: 'https://example.com/background.jpg',
        aspectRatio: '16:9',
      });

      // Fast forward the timer
      vi.advanceTimersByTime(5000);

      // Get the result
      const result = await resultPromise;

      // Verify the createMultiAvatarLipsync was called
      expect(mockAvatarApi.createMultiAvatarLipsync).toHaveBeenCalled();

      // Verify the createMultiAvatarLipsync was called with the correct structure
      expect(mockAvatarApi.createMultiAvatarLipsync).toHaveBeenCalledWith(
        expect.objectContaining({
          video_inputs: expect.any(Array),
          aspect_ratio: '16:9',
        })
      );

      // Verify the result structure
      expect(result).toEqual({
        id: 'lipsync-123456',
        status: 'done',
        url: 'https://example.com/videos/lipsync-123456.mp4',
      });

      // Restore real timers
      vi.useRealTimers();
    });

    it('should create a conversation video with avatar and voice names', async () => {
      // Mock timers for polling
      vi.useFakeTimers();

      // Create a conversation video using avatar and voice names
      const resultPromise = videoCreator.createConversation({
        conversation: [
          {
            avatarName: 'John',
            voiceName: 'English Male',
            text: 'Hello! How are you today?',
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

      // Fast forward the timer
      vi.advanceTimersByTime(5000);

      // Get the result
      const result = await resultPromise;

      // Verify that getAvatars and getVoices were called for name lookups
      expect(mockAvatarApi.getAvatars).toHaveBeenCalled();
      expect(mockAvatarApi.getVoices).toHaveBeenCalled();

      // Verify the createMultiAvatarLipsync was called
      expect(mockAvatarApi.createMultiAvatarLipsync).toHaveBeenCalled();

      // Verify the result structure
      expect(result).toEqual({
        id: 'lipsync-123456',
        status: 'done',
        url: 'https://example.com/videos/lipsync-123456.mp4',
      });

      // Restore real timers
      vi.useRealTimers();
    });
  });
});
