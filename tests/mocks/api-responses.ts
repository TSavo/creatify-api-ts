import { mockApiClientFactory, MockCreatifyApiClient } from './mock-api-client';
import { vi } from 'vitest';

// Common mock responses for testing
export const mockAvatarInfo = {
  id: 'avatar-123',
  avatar_id: 'avatar-123',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:00:00Z',
  gender: 'm',
  age_range: 'adult',
  location: 'outdoor',
  style: 'presenter',
  creator_name: 'Test Avatar',
  video_scene: 'Office setting',
  keywords: 'professional, business',
  preview_image_16_9: 'https://example.com/preview_16_9.jpg',
  preview_image_1_1: 'https://example.com/preview_1_1.jpg',
  preview_image_9_16: 'https://example.com/preview_9_16.jpg',
  preview_video_16_9: 'https://example.com/preview_16_9.mp4',
  preview_video_1_1: 'https://example.com/preview_1_1.mp4',
  preview_video_9_16: 'https://example.com/preview_9_16.mp4',
  landscape_preview_video: 'https://example.com/landscape.mp4',
  squared_preview_video: 'https://example.com/squared.mp4',
  is_active: true,
  process_status: 'done',
  failed_reason: '',
  type: 'standard',
};

export const mockVoiceInfo = {
  voice_id: 'voice-123',
  name: 'English Male',
  language: 'en',
  gender: 'male',
};

export const mockLipsyncResponse = {
  id: 'lipsync-123',
  status: 'pending',
  success: true,
};

export const mockLipsyncResultResponse = {
  id: 'lipsync-123',
  status: 'done',
  output: 'https://example.com/video.mp4',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true,
};

export const mockLipsyncErrorResponse = {
  id: 'lipsync-123',
  status: 'error',
  error_message: 'Failed to process video',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: false,
};

// Avatar and Lipsync mock objects for avatar.test.ts
export const mockAvatars = [
  {
    id: 'avatar-123',
    avatar_id: 'avatar-123',
    name: 'Business Person',
    gender: 'm',
    age_range: 'adult',
    location: 'indoor',
    style: 'presenter',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
  },
  {
    id: 'avatar-456',
    avatar_id: 'avatar-456',
    name: 'Teacher',
    gender: 'f',
    age_range: 'adult',
    location: 'indoor',
    style: 'casual',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
  },
];

export const mockVoices = [
  {
    voice_id: 'voice-123',
    id: 'voice-123',
    name: 'English Male',
    language: 'en',
    gender: 'male',
    accents: [],
    preview_url: '',
  },
  {
    voice_id: 'voice-456',
    id: 'voice-456',
    name: 'English Female',
    language: 'en',
    gender: 'female',
    accents: [],
    preview_url: '',
  },
];

export const mockLipsyncCreationResponse = {
  id: 'lipsync-123456',
  status: 'pending',
  text: 'Hello, this is a test message.',
  creator: 'avatar-123',
  aspect_ratio: '16:9',
  voice_id: 'voice-123',
  success: true,
};

export const mockLipsyncResults = {
  pending: {
    id: 'lipsync-123456',
    status: 'pending',
    text: 'Hello, this is a test message.',
    creator: 'avatar-123',
    aspect_ratio: '16:9',
    voice_id: 'voice-123',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
    success: true,
  },
  processing: {
    id: 'lipsync-123456',
    status: 'processing',
    text: 'Hello, this is a test message.',
    creator: 'avatar-123',
    aspect_ratio: '16:9',
    voice_id: 'voice-123',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: true,
  },
  done: {
    id: 'lipsync-123456',
    status: 'done',
    text: 'Hello, this is a test message.',
    creator: 'avatar-123',
    aspect_ratio: '16:9',
    voice_id: 'voice-123',
    output: 'https://example.com/video-123456.mp4',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:10:00Z',
    success: true,
  },
  error: {
    id: 'lipsync-123456',
    status: 'error',
    text: 'Hello, this is a test message.',
    creator: 'avatar-123',
    aspect_ratio: '16:9',
    voice_id: 'voice-123',
    error_message: 'Lipsync processing failed',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: false,
  },
};

export const mockTTSResponse = {
  id: 'tts-123',
  status: 'pending',
  script: 'Hello world',
  accent: 'voice-123',
  success: true,
};

export const mockTTSResultResponse = {
  id: 'tts-123',
  status: 'done',
  script: 'Hello world',
  accent: 'voice-123',
  output: 'https://example.com/audio.mp3',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true,
};

// TextToSpeech mock objects for testing the TextToSpeechApi
export const mockTextToSpeechCreationResponse = {
  id: 'tts-123456',
  status: 'pending',
  script: 'Hello, this is a test of the text-to-speech API.',
  accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
  success: true,
};

export const mockTextToSpeechResults = {
  pending: {
    id: 'tts-123456',
    status: 'pending',
    script: 'Hello, this is a test of the text-to-speech API.',
    accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
    success: true,
  },
  processing: {
    id: 'tts-123456',
    status: 'processing',
    script: 'Hello, this is a test of the text-to-speech API.',
    accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: true,
  },
  done: {
    id: 'tts-123456',
    status: 'done',
    script: 'Hello, this is a test of the text-to-speech API.',
    accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
    output: 'https://example.com/audio-123456.mp3',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:10:00Z',
    success: true,
  },
  error: {
    id: 'tts-123456',
    status: 'error',
    script: 'Hello, this is a test of the text-to-speech API.',
    accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
    error_message: 'Text-to-speech processing failed',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: false,
  },
};

// AI Editing mock objects for testing the AiEditingApi
export const mockAiEditingCreationResponse = {
  id: 'edit-123456',
  status: 'pending',
  video_url: 'https://example.com/video.mp4',
  editing_style: 'film',
  success: true,
};

export const mockAiEditingResults = {
  pending: {
    id: 'edit-123456',
    status: 'pending',
    video_url: 'https://example.com/video.mp4',
    editing_style: 'film',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
    success: true,
  },
  processing: {
    id: 'edit-123456',
    status: 'processing',
    video_url: 'https://example.com/video.mp4',
    editing_style: 'film',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: true,
  },
  done: {
    id: 'edit-123456',
    status: 'done',
    video_url: 'https://example.com/video.mp4',
    editing_style: 'film',
    output: 'https://example.com/edited-video-123456.mp4',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:10:00Z',
    success: true,
  },
  error: {
    id: 'edit-123456',
    status: 'error',
    video_url: 'https://example.com/video.mp4',
    editing_style: 'film',
    error_message: 'AI editing processing failed',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: false,
  },
};

export const mockLinkResponse = {
  id: 'link-123',
  url: 'https://example.com',
  link: {
    id: 'link-123',
    url: 'https://example.com',
    title: 'Example Page',
    description: 'This is an example page',
    image_urls: ['https://example.com/image.jpg'],
    video_urls: [],
    reviews: null,
    logo_url: 'https://example.com/logo.png',
  },
};

export const mockVideoResponse = {
  id: 'video-123',
  status: 'pending',
  link: 'link-123',
  media_job: 'job-123',
};

export const mockVideoResultResponse = {
  id: 'video-123',
  status: 'done',
  link: 'link-123',
  media_job: 'job-123',
  video_output: 'https://example.com/video.mp4',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
};

export const mockAiEditingResponse = {
  id: 'edit-123',
  status: 'pending',
  success: true,
};

export const mockAiEditingResultResponse = {
  id: 'edit-123',
  status: 'done',
  output: 'https://example.com/edited-video.mp4',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true,
};

export const mockCustomTemplateResponse = {
  id: 'template-123',
  status: 'pending',
  success: true,
};

export const mockCustomTemplateResultResponse = {
  id: 'template-123',
  status: 'done',
  output: 'https://example.com/template-video.mp4',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true,
};

export const mockDyoaResponse = {
  id: 'dyoa-123',
  user: 1,
  workspace: 'workspace-123',
  name: 'Custom Avatar',
  age_group: 'adult',
  gender: 'm',
  more_details: 'Brown hair, blue eyes',
  outfit_description: 'Business suit',
  background_description: 'Office setting',
  photos: [],
  reviews: [],
  status: 'initializing',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:00:00Z',
};

// DYOA mock objects for dyoa.test.ts
export const mockDyoaCreationResponse = {
  id: 'dyoa-123456',
  user: 1,
  workspace: 'workspace-123456',
  name: 'Tech Expert Avatar',
  age_group: 'adult',
  gender: 'f',
  more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
  outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
  background_description: 'Modern tech office environment, clean desk with laptop',
  photos: [],
  reviews: [],
  status: 'initializing',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:00:00Z',
};

export const mockDyoaWithPhotos = {
  id: 'dyoa-123456',
  user: 1,
  workspace: 'workspace-123456',
  name: 'Tech Expert Avatar',
  age_group: 'adult',
  gender: 'f',
  more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
  outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
  background_description: 'Modern tech office environment, clean desk with laptop',
  photos: [
    {
      id: 'photo-1',
      image: 'https://example.com/avatar-photo-1.jpg',
      created_at: '2023-01-01T12:30:00Z',
    },
    {
      id: 'photo-2',
      image: 'https://example.com/avatar-photo-2.jpg',
      created_at: '2023-01-01T12:35:00Z',
    },
  ],
  reviews: [],
  status: 'draft',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:35:00Z',
};

export const mockDyoaSubmittedForReview = {
  id: 'dyoa-123456',
  user: 1,
  workspace: 'workspace-123456',
  name: 'Tech Expert Avatar',
  age_group: 'adult',
  gender: 'f',
  more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
  outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
  background_description: 'Modern tech office environment, clean desk with laptop',
  photos: [
    {
      id: 'photo-1',
      image: 'https://example.com/avatar-photo-1.jpg',
      created_at: '2023-01-01T12:30:00Z',
    },
    {
      id: 'photo-2',
      image: 'https://example.com/avatar-photo-2.jpg',
      created_at: '2023-01-01T12:35:00Z',
    },
  ],
  reviews: [
    {
      id: 'review-1',
      status: 'pending',
      comment: null,
      photo: {
        id: 'photo-1',
        image: 'https://example.com/avatar-photo-1.jpg',
        created_at: '2023-01-01T12:30:00Z',
      },
      creator: null,
      social_link: null,
    },
  ],
  status: 'pending',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T13:00:00Z',
};

export const mockDyoaApproved = {
  id: 'dyoa-123456',
  user: 1,
  workspace: 'workspace-123456',
  name: 'Tech Expert Avatar',
  age_group: 'adult',
  gender: 'f',
  more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
  outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
  background_description: 'Modern tech office environment, clean desk with laptop',
  photos: [
    {
      id: 'photo-1',
      image: 'https://example.com/avatar-photo-1.jpg',
      created_at: '2023-01-01T12:30:00Z',
    },
    {
      id: 'photo-2',
      image: 'https://example.com/avatar-photo-2.jpg',
      created_at: '2023-01-01T12:35:00Z',
    },
  ],
  reviews: [
    {
      id: 'review-1',
      status: 'approved',
      comment: 'Looks great!',
      photo: {
        id: 'photo-1',
        image: 'https://example.com/avatar-photo-1.jpg',
        created_at: '2023-01-01T12:30:00Z',
      },
      creator: 'avatar-123',
      social_link: 'https://example.com/avatar-social',
    },
  ],
  status: 'approved',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T14:00:00Z',
};

export const mockDyoaList = [
  mockDyoaCreationResponse,
  mockDyoaWithPhotos,
  mockDyoaSubmittedForReview,
  mockDyoaApproved,
];

export const mockDyoaWithPhotosResponse = {
  id: 'dyoa-123',
  user: 1,
  workspace: 'workspace-123',
  name: 'Custom Avatar',
  age_group: 'adult',
  gender: 'm',
  more_details: 'Brown hair, blue eyes',
  outfit_description: 'Business suit',
  background_description: 'Office setting',
  photos: [
    {
      id: 'photo-123',
      image: 'https://example.com/avatar-photo.jpg',
      created_at: '2023-01-01T12:30:00Z',
    },
  ],
  reviews: [],
  status: 'draft',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
};

export const mockDyoaSubmittedResponse = {
  id: 'dyoa-123',
  user: 1,
  workspace: 'workspace-123',
  name: 'Custom Avatar',
  age_group: 'adult',
  gender: 'm',
  more_details: 'Brown hair, blue eyes',
  outfit_description: 'Business suit',
  background_description: 'Office setting',
  photos: [
    {
      id: 'photo-123',
      image: 'https://example.com/avatar-photo.jpg',
      created_at: '2023-01-01T12:30:00Z',
    },
  ],
  reviews: [
    {
      id: 'review-123',
      status: 'pending',
      comment: null,
      photo: {
        id: 'photo-123',
        image: 'https://example.com/avatar-photo.jpg',
        created_at: '2023-01-01T12:30:00Z',
      },
      creator: null,
      social_link: null,
    },
  ],
  status: 'pending',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T13:00:00Z',
};

// AI Shorts mock objects
export const mockAiShortsResponse = {
  id: 'shorts-123',
  status: 'pending',
  success: true,
};

export const mockAiShortsResultResponse = {
  id: 'shorts-123',
  status: 'done',
  output: 'https://example.com/shorts-video.mp4',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true,
};

export const mockAiShortsCreationResponse = {
  id: 'shorts-123456',
  status: 'pending',
  prompt: 'Create a viral video about technology trends',
  aspect_ratio: '9:16',
  success: true,
};

export const mockAiShortsResults = {
  pending: {
    id: 'shorts-123456',
    status: 'pending',
    prompt: 'Create a viral video about technology trends',
    aspect_ratio: '9:16',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
    success: true,
  },
  processing: {
    id: 'shorts-123456',
    status: 'processing',
    prompt: 'Create a viral video about technology trends',
    aspect_ratio: '9:16',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: true,
  },
  done: {
    id: 'shorts-123456',
    status: 'done',
    prompt: 'Create a viral video about technology trends',
    aspect_ratio: '9:16',
    output: 'https://example.com/shorts-123456.mp4',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:10:00Z',
    success: true,
  },
  error: {
    id: 'shorts-123456',
    status: 'error',
    prompt: 'Create a viral video about technology trends',
    aspect_ratio: '9:16',
    error_message: 'AI Shorts processing failed',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: false,
  },
};

// AI Scripts mock objects
export const mockAiScriptsResponse = {
  id: 'script-123',
  status: 'pending',
  success: true,
};

export const mockAiScriptsResultResponse = {
  id: 'script-123',
  status: 'done',
  script: 'This is a sample script generated by AI...',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true,
};

export const mockAiScriptsCreationResponse = {
  id: 'script-123456',
  status: 'pending',
  prompt: 'Write a script about technology trends',
  success: true,
};

export const mockAiScriptsResults = {
  pending: {
    id: 'script-123456',
    status: 'pending',
    prompt: 'Write a script about technology trends',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
    success: true,
  },
  processing: {
    id: 'script-123456',
    status: 'processing',
    prompt: 'Write a script about technology trends',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: true,
  },
  done: {
    id: 'script-123456',
    status: 'done',
    prompt: 'Write a script about technology trends',
    script: 'This is a sample script generated by AI...',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:10:00Z',
    success: true,
  },
  error: {
    id: 'script-123456',
    status: 'error',
    prompt: 'Write a script about technology trends',
    error_message: 'AI Scripts processing failed',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: false,
  },
};

// Musics mock objects
export const mockMusicCategories = [
  { name: 'Ambient' },
  { name: 'Electronic' },
  { name: 'Pop' },
  { name: 'Rock' },
];

export const mockMusicTracks = [
  {
    id: 'music-123',
    name: 'Ambient Melody',
    url: 'https://example.com/music/ambient-melody.mp3',
    category: 'Ambient',
    duration: 120,
  },
  {
    id: 'music-456',
    name: 'Electronic Beat',
    url: 'https://example.com/music/electronic-beat.mp3',
    category: 'Electronic',
    duration: 180,
  },
];

// Workspace mock objects
export const mockRemainingCreditsResponse = {
  remaining_credits: 500,
};

// Lipsync v2 mock objects
export const mockLipsyncV2Response = {
  id: 'lipsync-v2-123',
  status: 'pending',
  success: true,
};

export const mockLipsyncV2ResultResponse = {
  id: 'lipsync-v2-123',
  status: 'done',
  output: 'https://example.com/lipsync-v2-video.mp4',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true,
};

export const mockLipsyncV2CreationResponse = {
  id: 'lipsync-v2-123456',
  status: 'pending',
  success: true,
};

export const mockLipsyncV2Results = {
  pending: {
    id: 'lipsync-v2-123456',
    status: 'pending',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z',
    success: true,
  },
  processing: {
    id: 'lipsync-v2-123456',
    status: 'processing',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: true,
  },
  done: {
    id: 'lipsync-v2-123456',
    status: 'done',
    output: 'https://example.com/lipsync-v2-123456.mp4',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:10:00Z',
    success: true,
  },
  error: {
    id: 'lipsync-v2-123456',
    status: 'error',
    error_message: 'Lipsync v2 processing failed',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    success: false,
  },
};

export const mockErrorResponse = {
  status: 401,
  message: 'Invalid API credentials',
  data: {
    detail: 'Authentication credentials were not provided.',
  },
};

// Setup mock fetch for Vitest
export const setupMockFetch = () => {
  global.fetch = vi.fn();

  const jsonPromise = (data: any) => Promise.resolve(data);

  const mockFetchPromise = (data: any, status = 200) =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => jsonPromise(data),
    } as Response);

  return {
    mockFetchResolvedValue: (data: any, status = 200) => {
      (global.fetch as any).mockImplementation(() => mockFetchPromise(data, status));
    },
    mockFetchRejectedValue: (error: any) => {
      (global.fetch as any).mockImplementation(() => Promise.reject(error));
    },
  };
};

// Setup a test client with standard mocks
export const setupTestClient = () => {
  const client = mockApiClientFactory.createClient({
    apiId: 'test-api-id',
    apiKey: 'test-api-key',
  });

  // Reset all mocks
  const mockClient = mockApiClientFactory.getLastCreatedClient();
  mockClient?.reset();

  // Setup default mocks
  mockClient?.get.mockImplementation(endpoint => {
    if (endpoint === '/api/personas/') {
      return Promise.resolve([mockAvatarInfo]);
    }
    if (endpoint === '/api/voices/') {
      return Promise.resolve([mockVoiceInfo]);
    }
    if (endpoint.includes('/api/lipsyncs/') && !endpoint.includes('/api/lipsyncs_v2/')) {
      return Promise.resolve(mockLipsyncResultResponse);
    }
    if (endpoint.includes('/api/lipsyncs_v2/')) {
      return Promise.resolve(mockLipsyncV2ResultResponse);
    }
    if (endpoint.includes('/api/text_to_speech/')) {
      return Promise.resolve(mockTTSResultResponse);
    }
    if (endpoint.includes('/api/links/')) {
      return Promise.resolve(mockLinkResponse.link);
    }
    if (endpoint.includes('/api/link_to_videos/')) {
      return Promise.resolve(mockVideoResultResponse);
    }
    if (endpoint.includes('/api/ai_editing/')) {
      return Promise.resolve(mockAiEditingResultResponse);
    }
    if (endpoint.includes('/api/ai_shorts/')) {
      return Promise.resolve(mockAiShortsResultResponse);
    }
    if (endpoint.includes('/api/ai_scripts/')) {
      return Promise.resolve(mockAiScriptsResultResponse);
    }
    if (endpoint.includes('/api/custom_templates/')) {
      return Promise.resolve(mockCustomTemplateResultResponse);
    }
    if (endpoint.includes('/api/dyoa/')) {
      return Promise.resolve(mockDyoaWithPhotosResponse);
    }
    if (endpoint === '/api/music_categories/') {
      return Promise.resolve(mockMusicCategories);
    }
    if (endpoint === '/api/musics/') {
      return Promise.resolve(mockMusicTracks);
    }
    if (endpoint === '/api/remaining_credits/') {
      return Promise.resolve(mockRemainingCreditsResponse);
    }

    // Default response
    return Promise.resolve({ success: true });
  });

  mockClient?.post.mockImplementation(endpoint => {
    if (endpoint === '/api/lipsyncs/') {
      return Promise.resolve(mockLipsyncResponse);
    }
    if (endpoint === '/api/lipsyncs/multi_avatar/') {
      return Promise.resolve(mockLipsyncResponse);
    }
    if (endpoint.includes('/api/lipsyncs/') && endpoint.includes('/preview/')) {
      return Promise.resolve(mockLipsyncResponse);
    }
    if (endpoint.includes('/api/lipsyncs/') && endpoint.includes('/render/')) {
      return Promise.resolve(mockLipsyncResponse);
    }
    if (endpoint === '/api/lipsyncs_v2/') {
      return Promise.resolve(mockLipsyncV2Response);
    }
    if (endpoint.includes('/api/lipsyncs_v2/') && endpoint.includes('/preview/')) {
      return Promise.resolve(mockLipsyncV2Response);
    }
    if (endpoint.includes('/api/lipsyncs_v2/') && endpoint.includes('/render/')) {
      return Promise.resolve(mockLipsyncV2Response);
    }
    if (endpoint === '/api/text_to_speech/') {
      return Promise.resolve(mockTTSResponse);
    }
    if (endpoint === '/api/links/') {
      return Promise.resolve(mockLinkResponse);
    }
    if (endpoint === '/api/links/link_with_params/') {
      return Promise.resolve(mockLinkResponse);
    }
    if (endpoint === '/api/link_to_videos/') {
      return Promise.resolve(mockVideoResponse);
    }
    if (endpoint === '/api/ai_editing/') {
      return Promise.resolve(mockAiEditingResponse);
    }
    if (endpoint.includes('/api/ai_editing/') && endpoint.includes('/preview/')) {
      return Promise.resolve(mockAiEditingResponse);
    }
    if (endpoint.includes('/api/ai_editing/') && endpoint.includes('/render/')) {
      return Promise.resolve(mockAiEditingResponse);
    }
    if (endpoint === '/api/ai_shorts/') {
      return Promise.resolve(mockAiShortsResponse);
    }
    if (endpoint.includes('/api/ai_shorts/') && endpoint.includes('/preview/')) {
      return Promise.resolve(mockAiShortsResponse);
    }
    if (endpoint.includes('/api/ai_shorts/') && endpoint.includes('/render/')) {
      return Promise.resolve(mockAiShortsResponse);
    }
    if (endpoint === '/api/ai_scripts/') {
      return Promise.resolve(mockAiScriptsResponse);
    }
    if (endpoint === '/api/custom_templates/') {
      return Promise.resolve(mockCustomTemplateResponse);
    }
    if (endpoint.includes('/api/custom_templates/') && endpoint.includes('/preview/')) {
      return Promise.resolve(mockCustomTemplateResponse);
    }
    if (endpoint.includes('/api/custom_templates/') && endpoint.includes('/render/')) {
      return Promise.resolve(mockCustomTemplateResponse);
    }
    if (endpoint === '/api/dyoa/') {
      return Promise.resolve(mockDyoaResponse);
    }
    if (endpoint.includes('/api/dyoa/') && endpoint.includes('/submit_for_review/')) {
      return Promise.resolve(mockDyoaSubmittedResponse);
    }

    // Default response
    return Promise.resolve({ success: true });
  });

  mockClient?.put.mockImplementation(endpoint => {
    if (endpoint.includes('/api/links/')) {
      return Promise.resolve(mockLinkResponse.link);
    }

    // Default response
    return Promise.resolve({ success: true });
  });

  mockClient?.delete.mockImplementation(() => {
    return Promise.resolve({ success: true });
  });

  return { client, mockClient };
};
