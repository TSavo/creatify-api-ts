# Creatify API TypeScript Client

A comprehensive TypeScript client library for the [Creatify AI API](https://creatify.ai/api), providing easy access to AI Avatar generation, URL-to-Video conversion, Text-to-Speech, AI Editing, Custom Templates, DYOA services, and more.

## Installation

```bash
npm install @tsavo/creatify-api-ts
```

## Features

- **Type-Safe API**: Complete TypeScript definitions for all endpoints, parameters, and responses
- **Comprehensive Coverage**: Support for all Creatify API endpoints
- **Simplified Workflows**: Helper methods and utilities for common tasks
- **Batch Processing**: Tools for handling multiple API tasks concurrently
- **Automatic Polling**: Convenience methods that wait for task completion
- **Error Handling**: Comprehensive error handling and detailed error information
- **Webhook Support**: Built-in support for Creatify's webhook notifications

## API Authentication

To use the Creatify API, you need to obtain your API credentials from your Creatify account:

1. Log into your [Creatify account](https://video.creatify.ai/)
2. Click on the gear icon in the top-left corner
3. Navigate to Workspace Settings → Settings → API
4. Copy your X-API-ID and X-API-KEY

**Note**: API access is available to users subscribed to Creatify's Pro plan and above.

## Quick Start

```typescript
import { Creatify } from '@tsavo/creatify-api-ts';

// Initialize the client with API credentials from environment variables (recommended)
const creatify = new Creatify({
  apiId: process.env.CREATIFY_API_ID,  // Store your X-API-ID in environment variables
  apiKey: process.env.CREATIFY_API_KEY, // Store your X-API-KEY in environment variables
});

// For local development, you can use dotenv to load environment variables from a .env file
// npm install dotenv
// Then at the top of your file:
// import 'dotenv/config';
//
// Example .env file:
// CREATIFY_API_ID=your-api-id
// CREATIFY_API_KEY=your-api-key

// Create an AI avatar video
async function createVideo() {
  try {
    // Get available avatars
    const avatars = await creatify.avatar.getAvatars();
    console.log(`Found ${avatars.length} available avatars`);
    const avatarId = avatars[0].id; // Use the first available avatar

    // Get available voices
    const voices = await creatify.avatar.getVoices();
    console.log(`Found ${voices.length} available voices`);
    const voiceId = voices[0].id; // Use the first available voice

    // Create a lipsync video (non-blocking)
    console.log('Creating lipsync video...');
    const response = await creatify.avatar.createLipsync({
      text: "Hello world! This is a test video created with the Creatify API.",
      creator: avatarId,
      aspect_ratio: "16:9",
      accent: voiceId, // Optional voice ID
      name: "My First Creatify Video", // Optional name for the video
      webhook_url: "https://your-webhook-url.com/callback" // Optional webhook for notifications
    });

    console.log(`Video creation started with ID: ${response.id}`);
    console.log(`Current status: ${response.status}`);

    // Use the convenience method to create and wait for completion
    console.log('Creating another video and waiting for completion...');
    const result = await creatify.avatar.createAndWaitForLipsync({
      text: "This example uses the convenience method to wait for the video to complete.",
      creator: avatarId,
      aspect_ratio: "16:9",
      accent: voiceId
    });

    console.log(`Video completed! URL: ${result.output}`);
    console.log(`Credits used: ${result.credits_used}`);
    console.log(`Thumbnail: ${result.video_thumbnail}`);
  } catch (error) {
    console.error('Error creating video:', error.message);
    if (error.status) {
      console.error('Status code:', error.status);
    }
    if (error.data) {
      console.error('Error details:', error.data);
    }
  }
}
```

## API Modules

### Avatar API

The Avatar API allows you to create realistic AI avatar videos with lip-synced speech. You can use either text or audio input to generate videos with various customization options.

#### Available Methods

- `getAvatars()` - Get all available avatars
- `getAvatarsWithPagination(params)` - Get avatars with pagination
- `getCustomAvatars()` - Get custom avatars created by your account
- `getAvatar(id)` - Get a specific avatar by ID
- `createLipsync(params)` - Create a lipsync video task
- `getLipsyncs()` - Get all your lipsync tasks
- `getLipsync(id)` - Get a specific lipsync task by ID
- `createAndWaitForLipsync(params)` - Create a lipsync video and wait for completion
- `createMultiAvatarLipsync(params)` - Create a multi-avatar conversation video
- `createAndWaitForMultiAvatarLipsync(params)` - Create a multi-avatar video and wait for completion

#### Examples

```typescript
// Get available avatars with filtering options
const avatars = await creatify.avatar.getAvatars({
  gender: 'm',  // Filter by gender: 'm', 'f', or 'nb'
  age_range: 'adult', // Filter by age: 'child', 'teen', 'adult', 'senior'
  location: 'indoor', // Filter by location: 'indoor', 'outdoor', 'fantasy', 'other'
  style: 'presenter' // Filter by style: 'selfie', 'presenter', 'other'
});
console.log('Available avatars:', avatars);

// Get available voices with pagination
const voices = await creatify.avatar.getVoicesWithPagination({
  page: 1,
  page_size: 20
});
console.log('Available voices:', voices.results);
console.log('Total voices:', voices.count);

// Create a lipsync video with text input
const lipsyncResponse = await creatify.avatar.createLipsync({
  text: "Hello, this is a test of the Creatify AI Avatar API!",
  creator: "7350375b-9a98-51b8-934d-14d46a645dc2", // Avatar ID
  aspect_ratio: "16:9",
  accent: "6f8ca7a8-87b9-4f5d-905d-cc4598e79717", // Voice ID
  name: "My Test Video", // Optional name for the video
  green_screen: false, // Optional green screen background
  no_caption: false, // Include captions
  caption_style: "normal-black", // Caption style
  no_music: false, // Include background music
  webhook_url: "https://your-webhook-url.com/callback" // Optional webhook for notifications
});

// Create a lipsync video with audio input
const audioLipsyncResponse = await creatify.avatar.createLipsync({
  audio: "https://example.com/my-audio-file.mp3", // URL to audio file
  creator: "7350375b-9a98-51b8-934d-14d46a645dc2", // Avatar ID
  aspect_ratio: "16:9"
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
    {
      character: {
        type: "avatar",
        avatar_id: "18fccce8-86e7-5f31-abc8-18915cb872be",
        avatar_style: "normal"
      },
      voice: {
        type: "text",
        input_text: "And I'm the second avatar responding!",
        voice_id: "7a258b67-e1d3-4025-8904-8429daa3a34d"
      }
    }
  ],
  aspect_ratio: "9:16",
  webhook_url: "https://your-webhook-url.com/callback"
});

// Check status of a lipsync task
const lipsyncStatus = await creatify.avatar.getLipsync(lipsyncResponse.id);
console.log(`Status: ${lipsyncStatus.status}`);
console.log(`Progress: ${lipsyncStatus.progress}`);

// Use the convenience method to create and wait for completion
const completedVideo = await creatify.avatar.createAndWaitForLipsync({
  text: "This video will be ready when this method returns.",
  creator: "7350375b-9a98-51b8-934d-14d46a645dc2",
  aspect_ratio: "16:9",
  accent: "6f8ca7a8-87b9-4f5d-905d-cc4598e79717"
});

console.log(`Video URL: ${completedVideo.output}`);
```

#### Webhook Support

When creating lipsync videos, you can provide a `webhook_url` parameter to receive notifications when the video processing is complete or fails. The webhook will receive a POST request with the following data structure:

```json
{
  "id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "status": "done",
  "failed_reason": "",
  "output": "https://example.com/video.mp4"
}
```

Possible status values: `pending`, `in_queue`, `running`, `failed`, `done`

### URL-to-Video API

The URL-to-Video API allows you to convert any website into a professional video. The API analyzes the content of the webpage and generates a script, visuals, and voiceover automatically.

#### Available Methods

- `createLink(params)` - Create a link from a URL
- `getLinks()` - Get all your links
- `getLink(id)` - Get a specific link by ID
- `updateLink(id, params)` - Update a link
- `createVideoFromLink(params)` - Generate a video from a link
- `getVideoFromLink(id)` - Get a specific video by ID
- `getVideosFromLink()` - Get all your videos
- `createAndWaitForVideoFromLink(params)` - Create a video and wait for completion
- `generatePreviewFromLink(params)` - Generate a preview video
- `generatePreviewListAsync(params)` - Generate multiple preview videos asynchronously
- `renderVideoFromPreview(params)` - Render a final video from a preview

#### Examples

```typescript
// Create a link from a URL
const linkResponse = await creatify.urlToVideo.createLink({
  url: "https://example.com/product"
});
console.log(`Link created with ID: ${linkResponse.id}`);

// Create a link with additional parameters
const enhancedLinkResponse = await creatify.urlToVideo.createLinkWithParams({
  url: "https://example.com/product",
  params: {
    title: "Custom Product Title",
    description: "Custom product description that will be used in the video",
    price: "$99.99",
    features: ["Feature 1", "Feature 2", "Feature 3"],
    images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
  }
});

// Generate a video from the link
const videoResponse = await creatify.urlToVideo.createVideoFromLink({
  link: linkResponse.id,
  visual_style: "DynamicProductTemplate", // Visual style for the video
  script_style: "EnthusiasticWriter", // Script style for the narration
  aspect_ratio: "9:16", // Vertical video format
  language: "en", // Language for the script and voiceover
  webhook_url: "https://your-webhook-url.com/callback" // Optional webhook for notifications
});

// Check the status of a video
const videoStatus = await creatify.urlToVideo.getVideoFromLink(videoResponse.id);
console.log(`Video status: ${videoStatus.status}`);
console.log(`Progress: ${videoStatus.progress}`);

// Use the convenience method to create and wait for completion
const completedVideo = await creatify.urlToVideo.createAndWaitForVideoFromLink({
  link: linkResponse.id,
  visual_style: "ModernProductShowcase",
  script_style: "ProfessionalWriter",
  aspect_ratio: "16:9",
  language: "en"
});

console.log(`Video URL: ${completedVideo.output}`);

// Generate multiple preview videos to choose from
const previewListResponse = await creatify.urlToVideo.generatePreviewListAsync({
  link: linkResponse.id,
  visual_styles: ["DynamicProductTemplate", "ModernProductShowcase", "MinimalistProduct"],
  script_styles: ["EnthusiasticWriter", "ProfessionalWriter"],
  aspect_ratio: "16:9",
  language: "en"
});

// Once previews are generated, render the final video from a selected preview
const finalVideo = await creatify.urlToVideo.renderVideoFromPreview({
  preview_id: previewListResponse.previews[0].id
});
```

### Text-to-Speech API

The Text-to-Speech API converts text into natural-sounding speech using a variety of voices and accents. This API is useful for generating voiceovers, narrations, and audio content.

#### Available Methods

- `createTextToSpeech(params)` - Generate speech from text
- `getTextToSpeechList()` - Get all your text-to-speech tasks
- `getTextToSpeech(id)` - Get a specific text-to-speech task by ID
- `createAndWaitForTextToSpeech(params)` - Create a text-to-speech task and wait for completion

#### Examples

```typescript
// Get available voices for text-to-speech
const voices = await creatify.avatar.getVoices();
console.log('Available voices:', voices);

// Create a text-to-speech task
const ttsResponse = await creatify.textToSpeech.createTextToSpeech({
  script: "Hello! This is a test of the Creatify Text-to-Speech API. It generates natural-sounding speech from text input.",
  accent: "6f8ca7a8-87b9-4f5d-905d-cc4598e79717", // Voice ID
  name: "My TTS Test", // Optional name for the task
  webhook_url: "https://your-webhook-url.com/callback" // Optional webhook for notifications
});

console.log(`TTS task created with ID: ${ttsResponse.id}`);
console.log(`Status: ${ttsResponse.status}`);

// Check the status of a text-to-speech task
const ttsStatus = await creatify.textToSpeech.getTextToSpeech(ttsResponse.id);
console.log(`TTS status: ${ttsStatus.status}`);
console.log(`Progress: ${ttsStatus.progress}`);

// Use the convenience method to create and wait for completion
const completedTts = await creatify.textToSpeech.createAndWaitForTextToSpeech({
  script: "This is another example using the convenience method that waits for the audio to be generated.",
  accent: "6f8ca7a8-87b9-4f5d-905d-cc4598e79717"
});

console.log('Audio URL:', completedTts.output);
console.log('Credits used:', completedTts.credits_used);

// Get a list of all your text-to-speech tasks
const ttsList = await creatify.textToSpeech.getTextToSpeechList();
console.log(`You have ${ttsList.length} text-to-speech tasks`);
```

### AI Editing API

The AI Editing API allows you to automatically edit and enhance videos using AI. It can transform raw footage into professionally edited videos with different styles and pacing.

#### Available Methods

- `createAiEditing(params)` - Submit a video for AI editing
- `getAiEditingList()` - Get all your AI editing tasks
- `getAiEditing(id)` - Get a specific AI editing task by ID
- `createAndWaitForAiEditing(params)` - Submit a video and wait for editing to complete
- `generateAiEditingPreview(params)` - Generate a preview of an AI-edited video
- `renderAiEditing(params)` - Render a final version of an AI-edited video

#### Examples

```typescript
// Submit a video for AI editing
const editingResponse = await creatify.aiEditing.createAiEditing({
  video_url: "https://example.com/video.mp4", // URL to your video file
  editing_style: "film", // Editing style: "film", "commercial", "social", "vlog", etc.
  name: "My AI Edited Video", // Optional name for the task
  webhook_url: "https://your-webhook-url.com/callback" // Optional webhook for notifications
});

console.log(`AI Editing task created with ID: ${editingResponse.id}`);
console.log(`Status: ${editingResponse.status}`);

// Check the status of an AI editing task
const editingStatus = await creatify.aiEditing.getAiEditing(editingResponse.id);
console.log(`Editing status: ${editingStatus.status}`);
console.log(`Progress: ${editingStatus.progress}`);

// Use the convenience method to create and wait for completion
const completedEditing = await creatify.aiEditing.createAndWaitForAiEditing({
  video_url: "https://example.com/video.mp4",
  editing_style: "commercial"
});

console.log('Edited video URL:', completedEditing.output);
console.log('Credits used:', completedEditing.credits_used);

// Generate a preview of an AI-edited video
const previewResponse = await creatify.aiEditing.generateAiEditingPreview({
  id: editingResponse.id
});

console.log('Preview URL:', previewResponse.preview);

// Render the final version after reviewing the preview
const renderedVideo = await creatify.aiEditing.renderAiEditing({
  id: editingResponse.id
});

console.log('Final video URL:', renderedVideo.output);
```

### Custom Templates API

The Custom Templates API allows you to create videos using pre-designed templates for specific industries and use cases. You simply provide the data, and the API generates a professional video based on the template.

#### Available Methods

- `getCustomTemplates()` - Get all available custom templates
- `getCustomTemplate(id)` - Get a specific custom template by ID
- `createCustomTemplateVideo(params)` - Create a video using a custom template
- `getCustomTemplateVideos()` - Get all your custom template videos
- `getCustomTemplateVideo(id)` - Get a specific custom template video by ID
- `createAndWaitForCustomTemplateVideo(params)` - Create a video and wait for completion
- `generateCustomTemplatePreview(params)` - Generate a preview of a custom template video
- `renderCustomTemplateVideo(params)` - Render a final version of a custom template video

#### Examples

```typescript
// Get available custom templates
const templates = await creatify.customTemplates.getCustomTemplates();
console.log(`Found ${templates.length} available templates`);

// Create a real estate listing video
const templateResponse = await creatify.customTemplates.createCustomTemplateVideo({
  visual_style: "HouseSale", // Template ID or name
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
      image_2: "https://example.com/house2.jpg",
      image_3: "https://example.com/house3.jpg"
    }
  },
  aspect_ratio: "16:9", // Optional aspect ratio
  webhook_url: "https://your-webhook-url.com/callback" // Optional webhook for notifications
});

console.log(`Template video creation started with ID: ${templateResponse.id}`);
console.log(`Status: ${templateResponse.status}`);

// Check the status of a custom template video
const templateStatus = await creatify.customTemplates.getCustomTemplateVideo(templateResponse.id);
console.log(`Template video status: ${templateStatus.status}`);
console.log(`Progress: ${templateStatus.progress}`);

// Use the convenience method to create and wait for completion
const completedTemplate = await creatify.customTemplates.createAndWaitForCustomTemplateVideo({
  visual_style: "ProductPromotion",
  data: {
    product_name: "Premium Wireless Headphones",
    product_description: "Experience crystal-clear sound with our premium wireless headphones.",
    price: "$199.99",
    features: ["40-hour battery life", "Active noise cancellation", "Premium comfort"],
    product_images: {
      image_1: "https://example.com/headphones1.jpg",
      image_2: "https://example.com/headphones2.jpg"
    }
  },
  aspect_ratio: "9:16" // Vertical video for social media
});

console.log(`Template video completed! URL: ${completedTemplate.output}`);
```

### DYOA (Design Your Own Avatar) API

The DYOA (Design Your Own Avatar) API allows you to create custom AI avatars from text descriptions. You describe the avatar's appearance, and the API generates multiple options for you to choose from.

#### Available Methods

- `getDyoas()` - Get all your DYOA requests
- `getDyoa(id)` - Get a specific DYOA request by ID
- `createDyoa(params)` - Create a new DYOA request
- `createAndWaitForDyoaPhotos(params)` - Create a DYOA request and wait for photos to be generated
- `submitDyoaForReview(id, params)` - Submit a chosen photo for review and avatar creation
- `deleteDyoa(id)` - Delete a DYOA request

#### Examples

```typescript
// Create a DYOA request
const dyoaResponse = await creatify.dyoa.createDyoa({
  name: "Tech Expert Avatar", // Name for your custom avatar
  age_group: "adult", // Age group: "child", "teen", "adult", "senior"
  gender: "f", // Gender: "m", "f", "nb"
  more_details: "Mid-length brown hair with green eyes, professional appearance", // Detailed description
  outfit_description: "Professional blazer in navy blue with white blouse", // Outfit description
  background_description: "Modern office environment with city skyline view" // Background description
});

console.log(`DYOA request created with ID: ${dyoaResponse.id}`);
console.log(`Status: ${dyoaResponse.status}`);

// Check the status of a DYOA request
const dyoaStatus = await creatify.dyoa.getDyoa(dyoaResponse.id);
console.log(`DYOA status: ${dyoaStatus.status}`);
console.log(`Photos generated: ${dyoaStatus.photos ? dyoaStatus.photos.length : 0}`);

// Use the convenience method to create and wait for photos to be generated
const dyoaWithPhotos = await creatify.dyoa.createAndWaitForDyoaPhotos({
  name: "Marketing Specialist Avatar",
  age_group: "adult",
  gender: "m",
  more_details: "Short dark hair, glasses, friendly smile",
  outfit_description: "Casual business attire with light blue shirt",
  background_description: "Creative office space with plants and natural light"
});

console.log(`DYOA photos generated! Total photos: ${dyoaWithPhotos.photos.length}`);

// Display the generated photos
dyoaWithPhotos.photos.forEach((photo, index) => {
  console.log(`Photo ${index + 1}: ${photo.url}`);
});

if (dyoaWithPhotos.photos.length > 0) {
  // Submit the first photo for review and avatar creation
  const submittedDyoa = await creatify.dyoa.submitDyoaForReview(dyoaWithPhotos.id, {
    chosen_photo_id: dyoaWithPhotos.photos[0].id
  });

  console.log(`DYOA submitted for review with status: ${submittedDyoa.status}`);
  console.log(`Once approved, your custom avatar will be available for use in videos`);
}

// Get all your DYOA requests
const allDyoas = await creatify.dyoa.getDyoas();
console.log(`You have ${allDyoas.length} DYOA requests`);

// Delete a DYOA request if needed
// await creatify.dyoa.deleteDyoa(dyoaResponse.id);
```

## Utility Classes

The library includes several utility classes that simplify common tasks and workflows when working with the Creatify API.

### VideoCreator

The VideoCreator utility provides a simplified interface for creating avatar videos without having to manage the low-level API details.

```typescript
import { VideoCreator } from '@tsavo/creatify-api-ts/utils';

// Initialize the VideoCreator with your API credentials
const videoCreator = new VideoCreator('your-api-id', 'your-api-key');

// Create a video with avatar name and voice name (instead of IDs)
const videoResult = await videoCreator.createVideo({
  avatarName: "John",  // Will find avatar by name
  voiceName: "English Male",  // Will find voice by name
  script: "Hello! This is a test video created with the Creatify API.",
  aspectRatio: "16:9",
  greenScreen: false, // Optional green screen background
  noCaptions: false, // Include captions
  noMusic: false // Include background music
});

console.log(`Video created! MP4 URL: ${videoResult.url}`);
console.log(`Video duration: ${videoResult.duration} seconds`);

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
    },
    {
      avatarName: "John",
      voiceName: "English Male",
      text: "Wonderful! I wanted to discuss our new project."
    }
  ],
  backgroundUrl: "https://example.com/background.jpg", // Optional custom background
  aspectRatio: "16:9",
  waitForCompletion: true // Wait for the video to be fully processed
});

console.log(`Conversation video created! URL: ${conversationResult.url}`);

// Create a video with specific avatar and voice IDs (if you already know them)
const videoWithIdsResult = await videoCreator.createVideoWithIds({
  avatarId: "7350375b-9a98-51b8-934d-14d46a645dc2",
  voiceId: "6f8ca7a8-87b9-4f5d-905d-cc4598e79717",
  script: "This example uses specific avatar and voice IDs instead of names.",
  aspectRatio: "9:16" // Vertical video for social media
});

console.log(`Video created with IDs! URL: ${videoWithIdsResult.url}`);
```

### AudioProcessor

The AudioProcessor utility simplifies working with the Text-to-Speech API for generating audio content.

```typescript
import { AudioProcessor } from '@tsavo/creatify-api-ts/utils';

// Initialize the AudioProcessor with your API credentials
const audioProcessor = new AudioProcessor('your-api-id', 'your-api-key');

// Generate audio from text with a specific voice ID
const audioResult = await audioProcessor.generateAudio(
  "This is a test of the audio processor utility. It converts text to natural-sounding speech.",
  "7a258b67-e1d3-4025-8904-8429daa3a34d" // Voice ID
);

console.log(`Audio generated: ${audioResult.output}`);
console.log(`Audio duration: ${audioResult.duration} seconds`);

// Generate audio with a voice name instead of ID
const audioByNameResult = await audioProcessor.generateAudioWithVoiceName(
  "This example uses a voice name instead of an ID.",
  "English Female" // Voice name
);

console.log(`Audio generated with voice name: ${audioByNameResult.output}`);

// Generate multiple audio files with the same voice
const multipleAudios = await audioProcessor.generateMultipleAudios([
  "This is the first audio sample.",
  "This is the second audio sample.",
  "This is the third audio sample."
], "English Male");

multipleAudios.forEach((audio, index) => {
  console.log(`Audio ${index + 1}: ${audio.output}`);
});
```

### BatchProcessor

The BatchProcessor utility allows you to process multiple API tasks concurrently, improving efficiency when working with large numbers of requests.

```typescript
import { BatchProcessor } from '@tsavo/creatify-api-ts/utils';

// Initialize the BatchProcessor with your API credentials
const batchProcessor = new BatchProcessor('your-api-id', 'your-api-key');

// Process multiple text-to-speech tasks in batch
const batchResult = await batchProcessor.processTextToSpeechBatch([
  { script: "This is the first audio sample.", accent: "7a258b67-e1d3-4025-8904-8429daa3a34d" },
  { script: "This is the second audio sample.", accent: "7a258b67-e1d3-4025-8904-8429daa3a34d" },
  { script: "This is the third audio sample.", accent: "7a258b67-e1d3-4025-8904-8429daa3a34d" }
], {
  concurrency: 2, // Process 2 tasks at a time
  maxRetries: 3,  // Retry failed tasks up to 3 times with exponential backoff
  continueOnError: true // Continue processing other tasks if one fails
});

console.log(`Processed ${batchResult.length} text-to-speech tasks`);
batchResult.forEach((result, index) => {
  console.log(`Audio ${index + 1}: ${result.output}`);
});

// Process multiple avatar video tasks in batch
const avatarBatchResult = await batchProcessor.processAvatarBatch([
  {
    text: "Hello from the first avatar!",
    avatarId: "7350375b-9a98-51b8-934d-14d46a645dc2",
    aspect_ratio: "16:9"
  },
  {
    text: "Hello from the second avatar!",
    avatarId: "18fccce8-86e7-5f31-abc8-18915cb872be",
    aspect_ratio: "16:9"
  }
], { concurrency: 2 });

console.log(`Processed ${avatarBatchResult.length} avatar videos`);
avatarBatchResult.forEach((result, index) => {
  console.log(`Video ${index + 1}: ${result.output}`);
});

// Process multiple URL-to-Video tasks in batch
const urlBatchResult = await batchProcessor.processUrlToVideoBatch([
  {
    link: "link-id-1",
    visual_style: "DynamicProductTemplate",
    script_style: "EnthusiasticWriter",
    aspect_ratio: "16:9"
  },
  {
    link: "link-id-2",
    visual_style: "ModernProductShowcase",
    script_style: "ProfessionalWriter",
    aspect_ratio: "16:9"
  }
]);

console.log(`Processed ${urlBatchResult.length} URL-to-Video tasks`);
```

## Error Handling

The library provides comprehensive error handling with detailed information to help you diagnose and resolve issues when working with the API.

```typescript
try {
  const response = await creatify.avatar.createLipsync({
    text: "Hello world!",
    creator: "invalid-id" // Using an invalid avatar ID
  });
} catch (error) {
  console.error('API Error:', error.message);

  // Additional error information may be available
  if (error.status) {
    console.error('Status code:', error.status);
  }

  if (error.data) {
    console.error('Error details:', error.data);
  }
}
```

### Common Error Types

- **Authentication Errors**: Status code 401 - Check your API credentials
- **Validation Errors**: Status code 400 - Check your request parameters
- **Resource Not Found**: Status code 404 - Check IDs for avatars, voices, etc.
- **Rate Limiting**: Status code 429 - You've exceeded your API rate limits
- **Server Errors**: Status codes 500-599 - Internal Creatify API issues

### Error Handling Best Practices

1. Always wrap API calls in try/catch blocks
2. Check for specific error status codes to provide appropriate feedback
3. Implement retry logic for transient errors (e.g., network issues, rate limiting)
4. Log detailed error information for debugging

## Testing

The library includes comprehensive tests for all modules and utilities. To run the tests:

```bash
npm test
```

The test suite uses Vitest and includes unit tests for all API modules and utility classes. The tests use mocked API responses to ensure consistent results without making actual API calls.

## Pricing and Credits

Creatify API access is available on Pro and Enterprise plans. Different operations consume different amounts of credits:

- **Avatar Videos**: 5 credits per 30 seconds
- **URL-to-Video**: 10 credits per video
- **Text-to-Speech**: 1 credit per 30 seconds
- **AI Editing**: 10 credits per minute of input video
- **Custom Templates**: 10 credits per video
- **DYOA**: 10 credits per avatar creation

You can check your remaining credits using the Workspace API:

```typescript
const credits = await creatify.workspace.getRemainingCredits();
console.log(`Remaining credits: ${credits.remaining_credits}`);
```

## Troubleshooting

### Common Issues and Solutions

#### Authentication Errors

**Issue**: Receiving 401 Unauthorized errors when making API calls.
**Solution**:
- Verify that your API ID and API Key are correct
- Ensure you're using the correct credentials for your environment (production vs. development)
- Check that your Creatify subscription is active and includes API access

#### Rate Limiting

**Issue**: Receiving 429 Too Many Requests errors.
**Solution**:
- Implement exponential backoff retry logic
- Batch requests when possible using the BatchProcessor utility
- Consider upgrading your plan if you consistently hit rate limits

#### Long-Running Tasks Timing Out

**Issue**: API calls for video generation timing out before completion.
**Solution**:
- Use the `createAndWaitFor*` convenience methods which handle polling automatically
- Implement webhook notifications for asynchronous processing
- Increase timeout settings in your HTTP client

#### Video Generation Failures

**Issue**: Video generation tasks fail with error messages.
**Solution**:
- Check that avatar and voice IDs are valid
- Ensure text input doesn't exceed maximum length limits
- Verify that any provided URLs (for backgrounds, audio, etc.) are publicly accessible
- Review the error details returned in the API response

#### Type Errors in TypeScript

**Issue**: TypeScript compiler errors when using the library.
**Solution**:
- Ensure you're using the latest version of the library
- Check that your TypeScript version is compatible (v4.5+ recommended)
- Use explicit type annotations when TypeScript cannot infer types

## API Version Compatibility

This client library is compatible with Creatify API v2.0 and above. The library is regularly updated to support new features and endpoints as they are added to the Creatify API.

- **Creatify API v2.0-v2.5**: Fully supported
- **Creatify API v3.0+**: Supported with ongoing updates

For the most up-to-date information on API compatibility, please refer to the [Creatify API Documentation](https://creatify.mintlify.app/api-reference).

## Security Best Practices

When working with the Creatify API, follow these security best practices:

### API Credentials

- **Never hardcode API credentials** in your source code
- Use environment variables or a secure credential store
- Rotate API keys periodically
- Use different API keys for development and production environments

```typescript
// DON'T do this
const creatify = new Creatify({
  apiId: "your-hardcoded-api-id",
  apiKey: "your-hardcoded-api-key"
});

// DO this instead
const creatify = new Creatify({
  apiId: process.env.CREATIFY_API_ID,
  apiKey: process.env.CREATIFY_API_KEY
});
```

### Server-Side Usage

- Always use this library on the server-side, never in client-side browser code
- Implement proper access controls for your application's users
- Consider creating a proxy API that validates requests before passing them to Creatify

### Webhook Security

- Use HTTPS for all webhook URLs
- Implement webhook signature verification if available
- Add authentication to your webhook endpoints

### Content Security

- Validate and sanitize all user inputs before sending to the API
- Implement content moderation for user-generated scripts and inputs
- Review generated content before publishing to ensure it meets your standards

## Troubleshooting

### Common Issues and Solutions

#### Authentication Errors

**Issue**: Receiving 401 Unauthorized errors when making API calls.
**Solution**:
- Verify that your API ID and API Key are correct
- Ensure you're using the correct credentials for your environment (production vs. development)
- Check that your Creatify subscription is active and includes API access

#### Rate Limiting

**Issue**: Receiving 429 Too Many Requests errors.
**Solution**:
- Implement exponential backoff retry logic
- Batch requests when possible using the BatchProcessor utility
- Consider upgrading your plan if you consistently hit rate limits

#### Long-Running Tasks Timing Out

**Issue**: API calls for video generation timing out before completion.
**Solution**:
- Use the `createAndWaitFor*` convenience methods which handle polling automatically
- Implement webhook notifications for asynchronous processing
- Increase timeout settings in your HTTP client

#### Video Generation Failures

**Issue**: Video generation tasks fail with error messages.
**Solution**:
- Check that avatar and voice IDs are valid
- Ensure text input doesn't exceed maximum length limits
- Verify that any provided URLs (for backgrounds, audio, etc.) are publicly accessible
- Review the error details returned in the API response

#### Type Errors in TypeScript

**Issue**: TypeScript compiler errors when using the library.
**Solution**:
- Ensure you're using the latest version of the library
- Check that your TypeScript version is compatible (v4.5+ recommended)
- Use explicit type annotations when TypeScript cannot infer types

## API Version Compatibility

This client library is compatible with Creatify API v2.0 and above. The library is regularly updated to support new features and endpoints as they are added to the Creatify API.

- **Creatify API v2.0-v2.5**: Fully supported
- **Creatify API v3.0+**: Supported with ongoing updates

For the most up-to-date information on API compatibility, please refer to the [Creatify API Documentation](https://creatify.mintlify.app/api-reference).

## Security Best Practices

When working with the Creatify API, follow these security best practices:

### API Credentials

- **Never hardcode API credentials** in your source code
- Use environment variables or a secure credential store
- Rotate API keys periodically
- Use different API keys for development and production environments

```typescript
// DON'T do this
const creatify = new Creatify({
  apiId: "your-hardcoded-api-id",
  apiKey: "your-hardcoded-api-key"
});

// DO this instead
const creatify = new Creatify({
  apiId: process.env.CREATIFY_API_ID,
  apiKey: process.env.CREATIFY_API_KEY
});
```

### Server-Side Usage

- Always use this library on the server-side, never in client-side browser code
- Implement proper access controls for your application's users
- Consider creating a proxy API that validates requests before passing them to Creatify

### Webhook Security

- Use HTTPS for all webhook URLs
- Implement webhook signature verification if available
- Add authentication to your webhook endpoints

### Content Security

- Validate and sanitize all user inputs before sending to the API
- Implement content moderation for user-generated scripts and inputs
- Review generated content before publishing to ensure it meets your standards

## Contributing

### Semantic Versioning and Releases

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate version management and package publishing. This means:

1. **Automatic Versioning**: The version number is automatically determined based on commit messages
2. **Automated Release Notes**: Release notes are automatically generated from commit messages
3. **Automated Publishing**: Packages are automatically published to npm when changes are pushed to the main branch
4. **No Manual Version Updates**: You don't need to manually update version numbers in package.json

### Commit Message Format

To ensure proper versioning, please follow the [Conventional Commits](https://www.conventionalcommits.org/) format for your commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Where `type` is one of:

- **feat**: A new feature (minor version bump)
- **fix**: A bug fix (patch version bump)
- **docs**: Documentation changes (no version bump)
- **style**: Code style changes (no version bump)
- **refactor**: Code refactoring (no version bump)
- **perf**: Performance improvements (patch version bump)
- **test**: Adding or updating tests (no version bump)
- **chore**: Maintenance tasks (no version bump)

Add `BREAKING CHANGE:` in the commit body or footer to trigger a major version bump.

See [COMMIT_CONVENTION.md](./COMMIT_CONVENTION.md) for more details.

## 🌟 Related Projects

### 🎬 Creatify MCP Server

Want to use Creatify with AI assistants like Claude Desktop? Check out our **[Creatify MCP Server](https://github.com/TSavo/creatify-mcp)**!

```bash
npm install -g @tsavo/creatify-mcp
```

The MCP server exposes all Creatify capabilities as tools for AI assistants, making it possible to create videos through natural language conversations.

### 🔗 Other Projects

- **[Creatify AI](https://creatify.ai/)** - The amazing AI video generation platform
- **[Model Context Protocol](https://modelcontextprotocol.io/)** - Standardized AI assistant integration
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development

## 📞 Support & Community

- 📖 **[Creatify API Documentation](https://creatify.ai/api)** - Official API documentation
- 🐛 **[Report Issues](https://github.com/TSavo/creatify-api-ts/issues)** - Bug reports and feature requests
- 💬 **[GitHub Discussions](https://github.com/TSavo/creatify-api-ts/discussions)** - Community discussions
- 📧 **[Contact Author](mailto:listentomy@nefariousplan.com)** - Direct support
- 🎬 **[MCP Server](https://github.com/TSavo/creatify-mcp)** - Use with AI assistants

## 🙏 Acknowledgments

- **[Creatify AI](https://creatify.ai)** - For creating an incredible AI video generation platform
- **[TypeScript Community](https://www.typescriptlang.org/)** - For the amazing type system and tooling
- **All contributors** - Thank you for making this library better!

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Created with ❤️ by [T Savo](mailto:listentomy@nefariousplan.com)**

🌐 **[Horizon City](https://www.horizon-city.com)** - *Building the future of AI-powered creativity*

*Making AI video generation accessible to every TypeScript developer*

</div>
