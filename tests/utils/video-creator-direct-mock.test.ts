import { VideoCreator } from '../../src/utils/video-creator';
import { AvatarApi } from '../../src/api/avatar'; 
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the AvatarApi class directly
vi.mock('../../src/api/avatar', () => {
  return {
    AvatarApi: vi.fn().mockImplementation(() => {
      return {
        getAvatars: vi.fn().mockResolvedValue([{
          id: 'test-avatar-id',
          avatar_id: 'test-avatar-id',
          name: 'Test Avatar'
        }]),
        getVoices: vi.fn().mockResolvedValue([{
          voice_id: 'test-voice-id',
          name: 'Test Voice'
        }]),
        createLipsync: vi.fn().mockResolvedValue({
          id: 'test-lipsync-id',
          status: 'pending'
        }),
        getLipsync: vi.fn().mockResolvedValue({
          id: 'test-lipsync-id',
          status: 'done',
          output: 'https://example.com/video.mp4'
        }),
        createMultiAvatarLipsync: vi.fn().mockResolvedValue({
          id: 'test-multi-lipsync-id',
          status: 'pending'
        })
      };
    })
  };
});

describe('VideoCreator Direct Mock Test', () => {
  let videoCreator: VideoCreator;
  
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    
    // Create a new VideoCreator instance
    videoCreator = new VideoCreator('test-api-id', 'test-api-key');
  });
  
  it('should create a video successfully', async () => {
    // Test creating a video with direct IDs
    const result = await videoCreator.createVideo({
      avatarId: 'test-avatar-id',
      script: 'Hello world',
      aspectRatio: '16:9'
    });
    
    // Verify the result
    expect(result).toEqual({
      id: 'test-lipsync-id',
      status: 'done',
      url: 'https://example.com/video.mp4'
    });
  });
  
  it('should find avatar and voice by name', async () => {
    // Test creating a video with names
    const result = await videoCreator.createVideo({
      avatarName: 'Test Avatar',
      voiceName: 'Test Voice',
      script: 'Hello world'
    });
    
    // Verify the result
    expect(result).toEqual({
      id: 'test-lipsync-id',
      status: 'done',
      url: 'https://example.com/video.mp4'
    });
  });
  
  it('should create a conversation video', async () => {
    // Test creating a conversation
    const result = await videoCreator.createConversation({
      conversation: [
        {
          avatarId: 'test-avatar-id',
          voiceId: 'test-voice-id',
          text: 'Hello'
        },
        {
          avatarId: 'test-avatar-id-2',
          voiceId: 'test-voice-id-2',
          text: 'Hi there'
        }
      ]
    });
    
    // Verify the result
    expect(result).toEqual({
      id: 'test-multi-lipsync-id',
      status: 'done',
      url: 'https://example.com/video.mp4'
    });
  });
});
