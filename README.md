# Creatify API TypeScript Client

A TypeScript client library for the Creatify AI API, providing easy access to AI Avatar generation, URL-to-Video conversion, Text-to-Speech, AI Editing, Custom Templates, and DYOA services.

## Installation

```bash
npm install creatify-api-ts
```

## Features

- **Type-Safe API**: Complete TypeScript definitions for all endpoints, parameters, and responses
- **Comprehensive Coverage**: Support for all Creatify API endpoints
- **Simplified Workflows**: Helper methods and utilities for common tasks
- **Batch Processing**: Tools for handling multiple API tasks concurrently
- **Automatic Polling**: Convenience methods that wait for task completion
- **Error Handling**: Comprehensive error handling and detailed error information

## Quick Start

```typescript
import { Creatify } from 'creatify-api-ts';

// Initialize the client
const creatify = new Creatify({
  apiId: 'your-api-id',
  apiKey: 'your-api-key',
});

// Create an AI avatar video
async function createVideo() {
  // Get available avatars
  const avatars = await creatify.avatar.getAvatars();
  const avatarId = avatars[0].avatar_id;
  
  // Create a lipsync video
  const response = await creatify.avatar.createLipsync({
    text: "Hello world! This is a test video.",
    creator: avatarId,
    aspect_ratio: "16:9"
  });
  
  // Wait for completion
  const result = await creatify.avatar.createAndWaitForLipsync({
    text: "Hello world! This is a test video.",
    creator: avatarId,
    aspect_ratio: "16:9"
  });
  
  console.log(`Video URL: ${result.output}`);
}
```

## API Modules

### Avatar API

Create AI avatar videos with:

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

// Create a multi-avatar conversation
const multiAvatarResponse = await creatify.avatar.createMultiAvatarLipsync({
  video_inputs: [
    {
      character: {
        type: "avatar",
        avatar_id: "7350375b-9a98-51b8-934d-14d46a645dc2",
        avatar_style: "normal"
      },
      voice: {
        type: "text",
        input_text: "Hello, I'm the first avatar speaking!",
        voice_id: "6f8ca7a8-87b9-4f5d-905d-cc4598e79717"
      },
      background: {
        type: "image",
        url: "https://example.com/background.jpg"
      }
    },
    // Second avatar...
  ],
  aspect_ratio: "9:16"
});
```

### URL-to-Video API

Convert a website to a video:

```typescript
// Create a link from a URL
const linkResponse = await creatify.urlToVideo.createLink({
  url: "https://example.com/product"
});

// Generate a video from the link
const videoResponse = await creatify.urlToVideo.createVideoFromLink({
  link: linkResponse.id,
  visual_style: "DynamicProductTemplate",
  script_style: "EnthusiasticWriter",
  aspect_ratio: "9:16",
  language: "en"
});
```

### Text-to-Speech API

Convert text to natural-sounding speech:

```typescript
// Create a text-to-speech task
const ttsResponse = await creatify.textToSpeech.createTextToSpeech({
  script: "Hello! This is a test of the Creatify Text-to-Speech API.",
  accent: "6f8ca7a8-87b9-4f5d-905d-cc4598e79717" // Voice ID
});

// Use the convenience method to create and wait for completion
const completedTts = await creatify.textToSpeech.createAndWaitForTextToSpeech({
  script: "This is another example using the convenience method.",
  accent: "6f8ca7a8-87b9-4f5d-905d-cc4598e79717"
});

console.log('Audio URL:', completedTts.output);
```

### AI Editing API

Edit videos with AI:

```typescript
// Submit a video for AI editing
const editingResponse = await creatify.aiEditing.createAiEditing({
  video_url: "https://example.com/video.mp4",
  editing_style: "film"
});

// Use the convenience method to create and wait for completion
const completedEditing = await creatify.aiEditing.createAndWaitForAiEditing({
  video_url: "https://example.com/video.mp4",
  editing_style: "commercial"
});

console.log('Edited video URL:', completedEditing.output);
```

### Custom Templates API

Create videos using custom templates:

```typescript
// Create a real estate listing video
const templateResponse = await creatify.customTemplates.createCustomTemplate({
  visual_style: "HouseSale",
  data: {
    address: "123 Maple Avenue",
    city: "Los Angeles",
    state: "CA",
    sqft: 2400,
    bedrooms: 4,
    bathrooms: 3,
    price: 950000,
    listing_images: {
      image_1: "https://example.com/house1.jpg",
      image_2: "https://example.com/house2.jpg"
    }
  }
});
```

### DYOA (Design Your Own Avatar) API

Create custom avatars from descriptions:

```typescript
// Create a DYOA request
const dyoaResponse = await creatify.dyoa.createDyoa({
  name: "Tech Expert Avatar",
  age_group: "adult",
  gender: "f",
  more_details: "Mid-length brown hair with green eyes",
  outfit_description: "Professional blazer in navy blue",
  background_description: "Modern office environment"
});

// Wait for photos to be generated
const dyoaWithPhotos = await creatify.dyoa.createAndWaitForDyoaPhotos({
  name: "Tech Expert Avatar",
  age_group: "adult",
  gender: "f",
  more_details: "Mid-length brown hair with green eyes",
  outfit_description: "Professional blazer in navy blue",
  background_description: "Modern office environment"
});

if (dyoaWithPhotos.photos.length > 0) {
  // Submit the first photo for review
  const submittedDyoa = await creatify.dyoa.submitDyoaForReview(dyoaWithPhotos.id, {
    chosen_photo_id: dyoaWithPhotos.photos[0].id
  });
}
```

## Utility Classes

### VideoCreator

Simplified interface for creating videos:

```typescript
import { VideoCreator } from 'creatify-api-ts/utils';

// Initialize the VideoCreator
const videoCreator = new VideoCreator('your-api-id', 'your-api-key');

// Create a video with avatar name and voice name
const videoResult = await videoCreator.createVideo({
  avatarName: "John",  // Will find avatar by name
  voiceName: "English Male",  // Will find voice by name
  script: "Hello! This is a test video created with the Creatify API.",
  aspectRatio: "16:9"
});

console.log(`Video created! MP4 URL: ${videoResult.url}`);

// Create a conversation with multiple avatars
const conversationResult = await videoCreator.createConversation({
  conversation: [
    {
      avatarName: "John",
      voiceName: "English Male",
      text: "Hello! How are you today?"
    },
    {
      avatarName: "Emma",
      voiceName: "English Female",
      text: "I'm doing great, thanks for asking!"
    }
  ],
  backgroundUrl: "https://example.com/background.jpg",
  aspectRatio: "16:9"
});
```

### AudioProcessor

Utility for working with audio:

```typescript
import { AudioProcessor } from 'creatify-api-ts/utils';

// Initialize the AudioProcessor
const audioProcessor = new AudioProcessor('your-api-id', 'your-api-key');

// Generate audio from text
const audioResult = await audioProcessor.generateAudio(
  "This is a test of the audio processor utility.",
  "7a258b67-e1d3-4025-8904-8429daa3a34d" // Voice ID
);

console.log(`Audio generated: ${audioResult.output}`);
```

### BatchProcessor

Process multiple tasks concurrently:

```typescript
import { BatchProcessor } from 'creatify-api-ts/utils';

// Initialize the BatchProcessor
const batchProcessor = new BatchProcessor('your-api-id', 'your-api-key');

// Process multiple text-to-speech tasks in batch
const batchResult = await batchProcessor.processTextToSpeechBatch([
  { script: "This is the first audio sample.", accent: "7a258b67-e1d3-4025-8904-8429daa3a34d" },
  { script: "This is the second audio sample.", accent: "7a258b67-e1d3-4025-8904-8429daa3a34d" },
  { script: "This is the third audio sample.", accent: "7a258b67-e1d3-4025-8904-8429daa3a34d" }
], { concurrency: 2 });

// Process multiple avatar video tasks in batch
const avatarBatchResult = await batchProcessor.processAvatarBatch([
  { text: "Hello from the first avatar!", avatarId: "7350375b-9a98-51b8-934d-14d46a645dc2" },
  { text: "Hello from the second avatar!", avatarId: "18fccce8-86e7-5f31-abc8-18915cb872be" }
]);
```

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

## Testing

The library includes comprehensive tests for all modules and utilities. To run the tests:

```bash
npm test
```

## Authentication

You need to have a Creatify account with API access (available on Pro and Enterprise plans). Get your API credentials by:

1. Log into your Creatify account
2. Click on the gear icon in the top-left corner
3. Navigate to Workspace Settings -> Settings -> API
4. Copy your X-API-ID and X-API-KEY

## License

MIT
