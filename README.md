# Creatify API TypeScript Client

A TypeScript client library for the Creatify AI API, providing easy access to AI Avatar generation, URL-to-Video conversion, Text-to-Speech, AI Editing, Custom Templates, and DYOA services.

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

### Text-to-Speech API

Convert text to natural-sounding speech:

```typescript
// Get available voices
const voices = await creatify.avatar.getVoices();
const voice = voices.find(v => v.language === 'en') || voices[0];

// Create a text-to-speech task
const ttsResponse = await creatify.textToSpeech.createTextToSpeech({
  script: "Hello! This is a test of the Creatify Text-to-Speech API.",
  accent: voice.voice_id
});

console.log('Text-to-speech task created:', ttsResponse);

// Check the status and get the audio URL
const ttsResult = await creatify.textToSpeech.getTextToSpeech(ttsResponse.id);
console.log('Text-to-speech task status:', ttsResult);

// Use the convenience method to create and wait for completion
const completedTts = await creatify.textToSpeech.createAndWaitForTextToSpeech({
  script: "This is another example using the convenience method.",
  accent: voice.voice_id
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

console.log('AI editing task created:', editingResponse);

// Check the status and get the edited video URL
const editingResult = await creatify.aiEditing.getAiEditing(editingResponse.id);
console.log('AI editing task status:', editingResult);

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
    estimated_monthly_payment: 4750,
    openhouseDate_1: {
      date: "2023-09-23",
      time: "1:00pm"
    },
    listing_images: {
      image_1: "https://example.com/house1.jpg",
      image_2: "https://example.com/house2.jpg",
      image_3: "https://example.com/house3.jpg"
    },
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone_number: "555-123-4567",
    office_name: "Premier Real Estate",
    head_shot: "https://example.com/jane-smith.jpg"
  }
});

console.log('Custom template task created:', templateResponse);

// Check the status and get the video URL
const templateResult = await creatify.customTemplates.getCustomTemplate(templateResponse.id);
console.log('Custom template task status:', templateResult);
```

### DYOA (Design Your Own Avatar) API

Create custom avatars from descriptions:

```typescript
// Create a DYOA request
const dyoaResponse = await creatify.dyoa.createDyoa({
  name: "Tech Expert Avatar",
  age_group: "adult",
  gender: "f",
  more_details: "Mid-length brown hair with subtle highlights, green eyes, warm smile",
  outfit_description: "Professional blazer in navy blue, simple white blouse, minimal jewelry",
  background_description: "Modern tech office environment, clean desk with laptop"
});

console.log('DYOA request created:', dyoaResponse);

// Get the DYOA to check if photos are generated
const dyoaResult = await creatify.dyoa.getDyoa(dyoaResponse.id);

if (dyoaResult.photos.length > 0) {
  // Submit the first photo for review
  const submittedDyoa = await creatify.dyoa.submitDyoaForReview(dyoaResult.id, {
    chosen_photo_id: dyoaResult.photos[0].id
  });
  
  console.log('DYOA submitted for review:', submittedDyoa);
}

// List all your DYOAs
const allDyoas = await creatify.dyoa.getDyoaList();
console.log('All DYOAs:', allDyoas);
```

### Utility Classes

#### AudioProcessor

```typescript
import { AudioProcessor } from 'creatify-api-ts/utils';

// Initialize the AudioProcessor
const audioProcessor = new AudioProcessor('your-api-id', 'your-api-key');

// Generate audio from text
const audioResult = await audioProcessor.generateAudio(
  "This is a test of the audio processor utility.",
  "7a258b67-e1d3-4025-8904-8429daa3a34d" // Accent ID
);

console.log(`Audio generated: ${audioResult.output}`);
```

#### BatchProcessor

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

console.log(`Batch processing completed: ${batchResult.successes.length} successful, ${batchResult.errors.length} failed`);
```

#### VideoCreator

```typescript
import { VideoCreator } from 'creatify-api-ts/utils';

// Initialize the VideoCreator
const videoCreator = new VideoCreator('your-api-id', 'your-api-key');

// Create a video with an avatar and script
const videoResult = await videoCreator.createVideo({
  avatarName: "John",  // Optional: find avatar by name
  voiceName: "English",  // Optional: find voice by name
  script: "Hello! This is a test video created with the Creatify API.",
  aspectRatio: "16:9"
});

console.log(`Video created! MP4 URL: ${videoResult.url}`);
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
- `textToSpeech`: Text-to-Speech API module
- `aiEditing`: AI Editing API module
- `customTemplates`: Custom Templates API module
- `dyoa`: DYOA (Design Your Own Avatar) API module

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

### Text-to-Speech API

- `createTextToSpeech(params)`: Create a text-to-speech task
- `getTextToSpeech(id)`: Get a text-to-speech task by ID
- `getTextToSpeechList()`: Get all text-to-speech tasks
- `createAndWaitForTextToSpeech(params)`: Create a text-to-speech task and wait for completion

### AI Editing API

- `createAiEditing(params)`: Create an AI editing task
- `getAiEditing(id)`: Get an AI editing task by ID
- `getAiEditingList()`: Get all AI editing tasks
- `createAndWaitForAiEditing(params)`: Create an AI editing task and wait for completion

### Custom Templates API

- `createCustomTemplate(params)`: Create a custom template video
- `getCustomTemplate(id)`: Get a custom template task by ID
- `getCustomTemplateList()`: Get all custom template tasks
- `createAndWaitForCustomTemplate(params)`: Create a custom template video and wait for completion

### DYOA API

- `createDyoa(params)`: Create a DYOA with avatar details
- `getDyoa(id)`: Get a DYOA by ID
- `getDyoaList()`: Get all DYOAs
- `submitDyoaForReview(id, params)`: Submit a DYOA for review with chosen photo
- `deleteDyoa(id)`: Delete a DYOA
- `createAndWaitForDyoaPhotos(params)`: Create a DYOA and wait for photos to be generated
- `createSubmitAndWaitForDyoa(params)`: Create a DYOA, wait for photos, submit for review and wait for approval

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
