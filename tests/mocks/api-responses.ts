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
  type: 'standard'
};

export const mockVoiceInfo = {
  voice_id: 'voice-123',
  name: 'English Male',
  language: 'en',
  gender: 'male'
};

export const mockLipsyncResponse = {
  id: 'lipsync-123',
  status: 'pending',
  success: true
};

export const mockLipsyncResultResponse = {
  id: 'lipsync-123',
  status: 'done',
  output: 'https://example.com/video.mp4',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true
};

export const mockLipsyncErrorResponse = {
  id: 'lipsync-123',
  status: 'error',
  error_message: 'Failed to process video',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: false
};

export const mockTTSResponse = {
  id: 'tts-123',
  status: 'pending',
  script: 'Hello world',
  accent: 'voice-123',
  success: true
};

export const mockTTSResultResponse = {
  id: 'tts-123',
  status: 'done',
  script: 'Hello world',
  accent: 'voice-123',
  output: 'https://example.com/audio.mp3',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true
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
    logo_url: 'https://example.com/logo.png'
  }
};

export const mockVideoResponse = {
  id: 'video-123',
  status: 'pending',
  link: 'link-123',
  media_job: 'job-123'
};

export const mockVideoResultResponse = {
  id: 'video-123',
  status: 'done',
  link: 'link-123',
  media_job: 'job-123',
  video_output: 'https://example.com/video.mp4',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z'
};

export const mockAiEditingResponse = {
  id: 'edit-123',
  status: 'pending',
  success: true
};

export const mockAiEditingResultResponse = {
  id: 'edit-123',
  status: 'done',
  output: 'https://example.com/edited-video.mp4',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true
};

export const mockCustomTemplateResponse = {
  id: 'template-123',
  status: 'pending',
  success: true
};

export const mockCustomTemplateResultResponse = {
  id: 'template-123',
  status: 'done',
  output: 'https://example.com/template-video.mp4',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z',
  success: true
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
  updated_at: '2023-01-01T12:00:00Z'
};

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
      created_at: '2023-01-01T12:30:00Z'
    }
  ],
  reviews: [],
  status: 'draft',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:30:00Z'
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
      created_at: '2023-01-01T12:30:00Z'
    }
  ],
  reviews: [
    {
      id: 'review-123',
      status: 'pending',
      comment: null,
      photo: {
        id: 'photo-123',
        image: 'https://example.com/avatar-photo.jpg',
        created_at: '2023-01-01T12:30:00Z'
      },
      creator: null,
      social_link: null
    }
  ],
  status: 'pending',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T13:00:00Z'
};

export const mockErrorResponse = {
  status: 401,
  message: 'Invalid API credentials',
  data: {
    detail: 'Authentication credentials were not provided.'
  }
};

// Setup mock fetch for Vitest
export const setupMockFetch = () => {
  global.fetch = vi.fn();

  const jsonPromise = (data: any) => Promise.resolve(data);
  
  const mockFetchPromise = (data: any, status = 200) => 
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => jsonPromise(data)
    } as Response);

  return {
    mockFetchResolvedValue: (data: any, status = 200) => {
      (global.fetch as any).mockImplementation(() => mockFetchPromise(data, status));
    },
    mockFetchRejectedValue: (error: any) => {
      (global.fetch as any).mockImplementation(() => Promise.reject(error));
    }
  };
};

// Setup a test client with standard mocks
export const setupTestClient = () => {
  const client = mockApiClientFactory.createClient({
    apiId: 'test-api-id',
    apiKey: 'test-api-key'
  });
  
  // Reset all mocks
  const mockClient = mockApiClientFactory.getLastCreatedClient();
  mockClient?.reset();
  
  // Setup default mocks
  mockClient?.get.mockImplementation((endpoint) => {
    if (endpoint === '/api/personas/') {
      return Promise.resolve([mockAvatarInfo]);
    }
    if (endpoint === '/api/voices/') {
      return Promise.resolve([mockVoiceInfo]);
    }
    if (endpoint.includes('/api/lipsyncs/')) {
      return Promise.resolve(mockLipsyncResultResponse);
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
    if (endpoint.includes('/api/custom_templates/')) {
      return Promise.resolve(mockCustomTemplateResultResponse);
    }
    if (endpoint.includes('/api/dyoa/')) {
      return Promise.resolve(mockDyoaWithPhotosResponse);
    }
    
    // Default response
    return Promise.resolve({ success: true });
  });
  
  mockClient?.post.mockImplementation((endpoint) => {
    if (endpoint === '/api/lipsyncs/') {
      return Promise.resolve(mockLipsyncResponse);
    }
    if (endpoint === '/api/lipsyncs/multi_avatar/') {
      return Promise.resolve(mockLipsyncResponse);
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
    if (endpoint === '/api/custom_templates/') {
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
  
  mockClient?.put.mockImplementation((endpoint) => {
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
