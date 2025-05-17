# Creatify API TypeScript Client

A TypeScript client library for the Creatify AI API, providing easy access to AI Avatar generation, URL-to-Video conversion, and other Creatify services.

## Installation

```bash
npm install creatify-api-ts
```

## Usage

### Initialize the client

```typescript
import { Creatify } from 'creatify-api-ts';

const creatify = new Creatify({
  apiId: 'your-api-id',
  apiKey: 'your-api-key',
});
```

### AI Avatar API

Create a lipsync video with an AI avatar speaking:

```typescript
// Get available avatars
const avatars = await creatify.avatar.getAvatars();
console.log('Available avatars:', avatars);

// Get available voices
const voices = await creatify.avatar.getVoices();
console.log('Available voices:', voices);

// Create a lipsync video
const lipsyncResponse = await creatify.avatar.createLipsync({
  text: "Hello, this is a test of the Creatify AI Avatar API!",
  creator: "7350375b-9a98-51b8-934d-14d46a645dc2", // Avatar ID
  aspect_ratio: "16:9",
  voice_id: "6f8ca7a8-87b9-4f5d-905d-cc4598e79717", // Optional voice ID
});

console.log('Lipsync task created:', lipsyncResponse);

// Check the status of the lipsync task
const lipsyncResult = await creatify.avatar.getLipsync(lipsyncResponse.id);
console.log('Lipsync task status:', lipsyncResult);
```

Create a multi-avatar video with multiple characters:

```typescript
const multiAvatarResponse = await creatify.avatar.createMultiAvatarLipsync({
  video_inputs: [
    {
      character: {
        type: "avatar",
        avatar_id: "7350375b-9a98-51b8-934d-14d46a645dc2",
        avatar_style: "normal",
        offset: { x: -0.23, y: 0.35 }
      },
      voice: {
        type: "text",
        input_text: "Hello, I'm the first avatar speaking!",
        voice_id: "6f8ca7a8-87b9-4f5d-905d-cc4598e79717"
      },
      background: {
        type: "image",
        url: "https://example.com/background.jpg"
      },
      caption_setting: {
        style: "normal-black",
        offset: { x: 0, y: 0.45 }
      }
    },
    {
      character: {
        type: "avatar",
        avatar_id: "18fccce8-86e7-5f31-abc8-18915cb872be",
        avatar_style: "normal",
        offset: { x: -0.23, y: 0.35 }
      },
      voice: {
        type: "text",
        input_text: "And I'm the second avatar responding!",
        voice_id: "360ab221-d951-413b-ba1a-7037dc67da16"
      },
      background: {
        type: "image",
        url: "https://example.com/background.jpg"
      },
      caption_setting: {
        style: "normal-black",
        offset: { x: 0, y: 0.45 }
      }
    }
  ],
  aspect_ratio: "9:16"
});

console.log('Multi-avatar task created:', multiAvatarResponse);
```

### URL-to-Video API

Convert a website to a video:

```typescript
// Create a link from a URL
const linkResponse = await creatify.urlToVideo.createLink({
  url: "https://example.com/product"
});

console.log('Link created:', linkResponse);

// Generate a video from the link
const videoResponse = await creatify.urlToVideo.createVideoFromLink({
  link: linkResponse.id,
  visual_style: "DynamicProductTemplate",
  script_style: "EnthusiasticWriter",
  aspect_ratio: "9:16",
  video_length: 30,
  language: "en",
  target_audience: "tech enthusiasts",
  target_platform: "Tiktok"
});

console.log('Video task created:', videoResponse);

// Check the status of the video task
const videoResult = await creatify.urlToVideo.getVideo(videoResponse.id);
console.log('Video task status:', videoResult);
```

Create a custom link with your own parameters:

```typescript
const customLinkResponse = await creatify.urlToVideo.createLinkWithParams({
  title: "My Custom Product",
  description: "This is a detailed description of my amazing product that will be turned into a video.",
  image_urls: [
    "https://example.com/product-image-1.jpg",
    "https://example.com/product-image-2.jpg"
  ],
  logo_url: "https://example.com/logo.png"
});

console.log('Custom link created:', customLinkResponse);
```

## API Reference

### Configuration Options

```typescript
interface CreatifyApiOptions {
  apiId: string;    // The API ID from your Creatify account
  apiKey: string;   // The API key from your Creatify account
  baseUrl?: string; // Optional: Base URL for the API (default: https://api.creatify.ai)
  timeout?: number; // Optional: Request timeout in ms (default: 30000)
}
```

### Creatify Client

The main client that provides access to all API modules:

- `avatar`: AI Avatar API module
- `urlToVideo`: URL-to-Video API module

### Avatar API

- `getAvatars()`: Get all available avatars
- `getVoices()`: Get all available voices
- `createLipsync(params)`: Create a lipsync video
- `getLipsync(id)`: Get a lipsync task by ID
- `getLipsyncs()`: Get all lipsync tasks
- `createMultiAvatarLipsync(params)`: Create a multi-avatar lipsync video

### URL-to-Video API

- `createLink(params)`: Create a link from a URL
- `createLinkWithParams(params)`: Create a custom link
- `updateLink(id, params)`: Update an existing link
- `getLink(id)`: Get a link by ID
- `getLinks()`: Get all links
- `createVideoFromLink(params)`: Create a video from a link
- `getVideo(id)`: Get a video task by ID
- `getVideos()`: Get all video tasks

## Authentication

You need to have a Creatify account with API access (available on Pro and Enterprise plans). Get your API credentials by:

1. Log into your Creatify account
2. Click on the gear icon in the top-left corner
3. Navigate to Workspace Settings -> Settings -> API
4. Copy your X-API-ID and X-API-KEY

## Error Handling

The library provides detailed error information:

```typescript
try {
  const response = await creatify.avatar.createLipsync({
    text: "Hello world!",
    creator: "invalid-id"
  });
} catch (error) {
  console.error('API Error:', error.message);
  
  // Additional error information may be available
  if (error.status) {
    console.error('Status code:', error.status);
  }
  
  if (error.data) {
    console.error('Error data:', error.data);
  }
}
```

## License

MIT
