/**
 * Mock API responses for testing
 */

/**
 * Mock avatar list response
 */
export const mockAvatars = [
  {
    avatar_id: '7350375b-9a98-51b8-934d-14d46a645dc2',
    name: 'John',
    preview_url: 'https://example.com/avatars/john.jpg',
    style: 'normal',
    tags: ['male', 'professional']
  },
  {
    avatar_id: '18fccce8-86e7-5f31-abc8-18915cb872be',
    name: 'Emma',
    preview_url: 'https://example.com/avatars/emma.jpg',
    style: 'casual',
    tags: ['female', 'casual']
  }
];

/**
 * Mock voice list response
 */
export const mockVoices = [
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
  },
  {
    voice_id: 'a5e7d9c3-f8b0-4e1a-9c5d-2b7f6a8c9e0d',
    name: 'French Male',
    language: 'fr',
    gender: 'male'
  }
];

/**
 * Mock lipsync creation response
 */
export const mockLipsyncCreationResponse = {
  success: true,
  id: 'lipsync-123456',
  status: 'pending'
};

/**
 * Mock lipsync result responses for different statuses
 */
export const mockLipsyncResults = {
  pending: {
    success: true,
    id: 'lipsync-123456',
    status: 'pending',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z'
  },
  processing: {
    success: true,
    id: 'lipsync-123456',
    status: 'processing',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:01:00Z'
  },
  done: {
    success: true,
    id: 'lipsync-123456',
    status: 'done',
    output: 'https://example.com/videos/lipsync-123456.mp4',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z'
  },
  error: {
    success: false,
    id: 'lipsync-123456',
    status: 'error',
    error_message: 'An error occurred while processing the video',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:02:00Z'
  }
};

/**
 * Mock link creation response
 */
export const mockLinkCreationResponse = {
  success: true,
  id: 'link-123456',
  url: 'https://example.com/product',
  link: {
    id: 'link-123456',
    url: 'https://example.com/product',
    title: 'Example Product',
    description: 'This is an example product description',
    image_urls: [
      'https://example.com/images/product1.jpg',
      'https://example.com/images/product2.jpg'
    ],
    video_urls: [],
    logo_url: 'https://example.com/logo.png',
    ai_summary: 'A high-quality product with excellent features'
  },
  credits_used: 1
};

/**
 * Mock video creation response
 */
export const mockVideoCreationResponse = {
  success: true,
  id: 'video-123456',
  status: 'pending'
};

/**
 * Mock video result responses for different statuses
 */
export const mockVideoResults = {
  pending: {
    success: true,
    id: 'video-123456',
    status: 'pending',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z'
  },
  processing: {
    success: true,
    id: 'video-123456',
    status: 'processing',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:01:00Z'
  },
  done: {
    success: true,
    id: 'video-123456',
    status: 'done',
    output: 'https://example.com/videos/video-123456.mp4',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:10:00Z'
  },
  error: {
    success: false,
    id: 'video-123456',
    status: 'error',
    error_message: 'An error occurred while processing the video',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:02:00Z'
  }
};

/**
 * Mock text-to-speech creation response
 */
export const mockTextToSpeechCreationResponse = {
  success: true,
  id: 'tts-123456',
  status: 'pending'
};

/**
 * Mock text-to-speech result responses for different statuses
 */
export const mockTextToSpeechResults = {
  pending: {
    success: true,
    id: 'tts-123456',
    status: 'pending',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z'
  },
  processing: {
    success: true,
    id: 'tts-123456',
    status: 'processing',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:01:00Z'
  },
  done: {
    success: true,
    id: 'tts-123456',
    status: 'done',
    output: 'https://example.com/audio/tts-123456.mp3',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:03:00Z'
  },
  error: {
    success: false,
    id: 'tts-123456',
    status: 'error',
    error_message: 'An error occurred while processing the audio',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:02:00Z'
  }
};

/**
 * Mock AI editing creation response
 */
export const mockAiEditingCreationResponse = {
  success: true,
  id: 'edit-123456',
  status: 'pending'
};

/**
 * Mock AI editing result responses for different statuses
 */
export const mockAiEditingResults = {
  pending: {
    success: true,
    id: 'edit-123456',
    status: 'pending',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z'
  },
  processing: {
    success: true,
    id: 'edit-123456',
    status: 'processing',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:01:00Z'
  },
  done: {
    success: true,
    id: 'edit-123456',
    status: 'done',
    output: 'https://example.com/videos/edit-123456.mp4',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:15:00Z'
  },
  error: {
    success: false,
    id: 'edit-123456',
    status: 'error',
    error_message: 'An error occurred while editing the video',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:02:00Z'
  }
};

/**
 * Mock custom template creation response
 */
export const mockCustomTemplateCreationResponse = {
  success: true,
  id: 'template-123456',
  status: 'pending'
};

/**
 * Mock custom template result responses for different statuses
 */
export const mockCustomTemplateResults = {
  pending: {
    success: true,
    id: 'template-123456',
    status: 'pending',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z'
  },
  processing: {
    success: true,
    id: 'template-123456',
    status: 'processing',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:01:00Z'
  },
  done: {
    success: true,
    id: 'template-123456',
    status: 'done',
    output: 'https://example.com/videos/template-123456.mp4',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:08:00Z'
  },
  error: {
    success: false,
    id: 'template-123456',
    status: 'error',
    error_message: 'An error occurred while processing the template video',
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:02:00Z'
  }
};

/**
 * Mock DYOA creation response
 */
export const mockDyoaCreationResponse = {
  id: 'dyoa-123456',
  user: 12345,
  workspace: 'workspace-123',
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
  updated_at: '2023-01-01T12:00:00Z'
};

/**
 * Mock DYOA with generated photos
 */
export const mockDyoaWithPhotos = {
  id: 'dyoa-123456',
  user: 12345,
  workspace: 'workspace-123',
  name: 'Tech Expert Avatar',
  age_group: 'adult',
  gender: 'f',
  more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
  outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
  background_description: 'Modern tech office environment, clean desk with laptop',
  photos: [
    {
      id: 'photo-1',
      image: 'https://example.com/dyoa/photo-1.jpg',
      created_at: '2023-01-01T12:05:00Z'
    },
    {
      id: 'photo-2',
      image: 'https://example.com/dyoa/photo-2.jpg',
      created_at: '2023-01-01T12:05:00Z'
    },
    {
      id: 'photo-3',
      image: 'https://example.com/dyoa/photo-3.jpg',
      created_at: '2023-01-01T12:05:00Z'
    }
  ],
  reviews: [],
  status: 'draft',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:05:00Z'
};

/**
 * Mock DYOA submitted for review
 */
export const mockDyoaSubmittedForReview = {
  id: 'dyoa-123456',
  user: 12345,
  workspace: 'workspace-123',
  name: 'Tech Expert Avatar',
  age_group: 'adult',
  gender: 'f',
  more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
  outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
  background_description: 'Modern tech office environment, clean desk with laptop',
  photos: [
    {
      id: 'photo-1',
      image: 'https://example.com/dyoa/photo-1.jpg',
      created_at: '2023-01-01T12:05:00Z'
    },
    {
      id: 'photo-2',
      image: 'https://example.com/dyoa/photo-2.jpg',
      created_at: '2023-01-01T12:05:00Z'
    },
    {
      id: 'photo-3',
      image: 'https://example.com/dyoa/photo-3.jpg',
      created_at: '2023-01-01T12:05:00Z'
    }
  ],
  reviews: [
    {
      id: 'review-1',
      status: 'pending',
      comment: null,
      photo: {
        id: 'photo-1',
        image: 'https://example.com/dyoa/photo-1.jpg',
        created_at: '2023-01-01T12:05:00Z'
      },
      creator: null,
      social_link: null
    }
  ],
  status: 'pending',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T12:10:00Z'
};

/**
 * Mock DYOA approved
 */
export const mockDyoaApproved = {
  id: 'dyoa-123456',
  user: 12345,
  workspace: 'workspace-123',
  name: 'Tech Expert Avatar',
  age_group: 'adult',
  gender: 'f',
  more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
  outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
  background_description: 'Modern tech office environment, clean desk with laptop',
  photos: [
    {
      id: 'photo-1',
      image: 'https://example.com/dyoa/photo-1.jpg',
      created_at: '2023-01-01T12:05:00Z'
    },
    {
      id: 'photo-2',
      image: 'https://example.com/dyoa/photo-2.jpg',
      created_at: '2023-01-01T12:05:00Z'
    },
    {
      id: 'photo-3',
      image: 'https://example.com/dyoa/photo-3.jpg',
      created_at: '2023-01-01T12:05:00Z'
    }
  ],
  reviews: [
    {
      id: 'review-1',
      status: 'approved',
      comment: 'Avatar approved',
      photo: {
        id: 'photo-1',
        image: 'https://example.com/dyoa/photo-1.jpg',
        created_at: '2023-01-01T12:05:00Z'
      },
      creator: 'avatar-123456',
      social_link: null
    }
  ],
  status: 'approved',
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2023-01-01T14:00:00Z'
};

/**
 * Mock DYOA list response
 */
export const mockDyoaList = [
  mockDyoaApproved,
  {
    id: 'dyoa-654321',
    user: 12345,
    workspace: 'workspace-123',
    name: 'Business Consultant Avatar',
    age_group: 'middle_aged',
    gender: 'm',
    more_details: 'Professional appearance, short dark hair, glasses',
    outfit_description: 'Dark suit with blue tie',
    background_description: 'Modern office with city view',
    photos: [],
    reviews: [],
    status: 'initializing',
    created_at: '2023-01-02T12:00:00Z',
    updated_at: '2023-01-02T12:00:00Z'
  }
];

/**
 * Mock error response
 */
export const mockErrorResponse = {
  success: false,
  error: 'Invalid API credentials'
};
