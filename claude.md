# Creatify API TypeScript Library

## Overview

This is a TypeScript wrapper library for the Creatify AI API, providing easy access to AI Avatar generation, URL-to-Video conversion, and other Creatify services through a clean, type-safe interface.

## Project Structure

```
C:\Users\T\Projects\creatify-api\
│
├── src/                      # Source code
│   ├── api/                  # API modules
│   │   ├── avatar.ts         # AI Avatar API
│   │   ├── url-to-video.ts   # URL-to-Video API
│   │   └── index.ts          # API modules export
│   ├── types/                # Type definitions
│   │   └── index.ts          # All types and interfaces
│   ├── utils/                # Utility classes
│   │   ├── video-creator.ts  # Simplified video creation
│   │   └── index.ts          # Utils exports
│   ├── client.ts             # Base API client
│   └── index.ts              # Main exports
│
├── examples/                 # Example usage
│   ├── basic-usage.ts        # Basic API examples
│   ├── create-avatar-video.ts    # Avatar video creation
│   ├── create-multi-avatar-conversation.ts  # Multi-avatar example
│   ├── simplified-video-creation.ts   # Using VideoCreator utility
│   └── create-video.js       # Command-line script
│
├── dist/                     # Compiled output (generated)
├── node_modules/             # Dependencies (generated)
│
├── package.json              # Project configuration
├── tsconfig.json             # TypeScript configuration
├── tsup.config.ts            # Build configuration
├── README.md                 # Documentation
├── LICENSE                   # MIT License
├── .gitignore                # Git ignore file
├── checkpoint.md             # Progress tracking
└── claude.md                 # This file
```

## Features

1. **Type-Safe API**: Complete TypeScript definitions for all Creatify API endpoints, parameters, and responses.

2. **Easy Authentication**: Simple setup with API ID and key from Creatify account.

3. **Modular Design**: Separate modules for different API areas (Avatar, URL-to-Video).

4. **Error Handling**: Comprehensive error handling with detailed error information.

5. **Documentation**: Full JSDoc comments and README with examples.

6. **Helper Utilities**: VideoCreator utility for simplified video creation.

7. **Examples**: Sample code showing common use cases.

## API Modules Implemented

1. **Avatar API**: Create AI avatar videos with:
   - List available avatars and voices
   - Create lipsync videos (single avatar speaking)
   - Create multi-avatar videos (multiple characters in one video)
   - Check task status and retrieve results

2. **URL-to-Video API**: Convert web content to videos:
   - Create links from URLs
   - Create custom links with specified content
   - Generate videos from links with various styles
   - Update links and check video generation status

3. **Utilities**: Helper classes for common tasks:
   - VideoCreator for simplified video creation
   - Avatar and voice search by name
   - Automatic polling for task completion

## Creating MP4 Videos with Avatars

The library provides multiple ways to create MP4 videos with avatars:

### Using the VideoCreator utility (recommended):

```typescript
import { VideoCreator } from 'creatify-api-ts/utils';

// Initialize the VideoCreator
const videoCreator = new VideoCreator('your-api-id', 'your-api-key');

// Create a video with an avatar and script
const result = await videoCreator.createVideo({
  avatarName: 'John',  // Optional: find avatar by name
  voiceName: 'English',  // Optional: find voice by name
  script: "Hello! This is a test video created with the Creatify API.",
  aspectRatio: "16:9"
});

console.log(`Video created! MP4 URL: ${result.url}`);
```

### Using the core API:

```typescript
import { Creatify } from 'creatify-api-ts';

// Initialize the API client
const creatify = new Creatify({
  apiId: 'your-api-id',
  apiKey: 'your-api-key'
});

// Get available avatars
const avatars = await creatify.avatar.getAvatars();
const avatarId = avatars[0].avatar_id;

// Create a lipsync video
const response = await creatify.avatar.createLipsync({
  text: "Hello world! This is a test video.",
  creator: avatarId,
  aspect_ratio: "16:9"
});

// Poll for completion
let result = await creatify.avatar.getLipsync(response.id);
while (result.status !== 'done' && result.status !== 'error') {
  await new Promise(resolve => setTimeout(resolve, 5000));
  result = await creatify.avatar.getLipsync(response.id);
}

console.log(`Video URL: ${result.output}`);
```

### Command-line script:

```bash
node examples/create-video.js your-api-id your-api-key "Hello world!" "John" "English Male"
```

## Getting Started

1. Install dependencies and build the library:
   ```bash
   cd C:\Users\T\Projects\creatify-api
   npm install
   npm run build
   ```

2. Try the examples (you'll need to add your Creatify API credentials):
   ```bash
   # Use the command-line script for a quick test
   node examples/create-video.js your-api-id your-api-key "Hello world!"
   
   # Or compile and run the TypeScript examples
   npx tsc examples/simplified-video-creation.ts --esModuleInterop
   node examples/simplified-video-creation.js
   ```

3. Reference the README.md for complete documentation and example usage.

## Development

The project is set up with:
- TypeScript for type-safe development
- tsup for simplified building
- ESM and CommonJS module output
- Source maps for debugging

## Notes

- A Creatify account with API access (Pro or Enterprise plan) is required to use this library.
- API credentials can be found in Workspace Settings → Settings → API in your Creatify account.