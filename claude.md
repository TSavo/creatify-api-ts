# Creatify API TypeScript Library

## Overview

This is a TypeScript wrapper library for the Creatify AI API, providing easy access to AI Avatar generation, URL-to-Video conversion, and other Creatify services through a clean, type-safe interface. The library is now fully implemented, documented, and ready for production use.

## Project Structure

```
C:\Users\T\Projects\creatify-api\
│
├── src/                      # Source code
│   ├── api/                  # API modules
│   │   ├── avatar.ts         # AI Avatar API
│   │   ├── url-to-video.ts   # URL-to-Video API
│   │   ├── text-to-speech.ts # Text-to-Speech API
│   │   ├── ai-editing.ts     # AI Editing API
│   │   ├── custom-templates.ts # Custom Templates API
│   │   ├── dyoa.ts           # DYOA API
│   │   └── index.ts          # API modules export
│   ├── types/                # Type definitions
│   │   ├── api-client.ts     # API client interfaces
│   │   └── index.ts          # All types and interfaces
│   ├── utils/                # Utility classes
│   │   ├── video-creator.ts  # Simplified video creation
│   │   ├── audio-processor.ts # Audio processing utilities
│   │   ├── batch-processor.ts # Batch processing utilities
│   │   └── index.ts          # Utils exports
│   ├── client-factory.ts     # Factory for creating API clients
│   ├── client.ts             # Base API client
│   └── index.ts              # Main exports
│
├── dist/                     # Compiled output (generated)
│
├── tests/                    # Test suite
│   ├── api/                  # Tests for API modules
│   ├── utils/                # Tests for utility classes
│   ├── client.test.ts        # Tests for base client
│   └── mocks/                # Mock data for testing
│
├── examples/                 # Example usage
│   ├── basic-usage.ts        # Basic API examples
│   ├── create-avatar-video.ts # Avatar video creation
│   └── ...                   # Other examples
│
├── .github/                  # GitHub-specific files
│   └── workflows/            # GitHub Actions workflows
│       └── ci.yml            # CI/CD configuration
│
├── package.json              # Project configuration
├── tsconfig.json             # TypeScript configuration
├── tsup.config.ts            # Build configuration
├── README.md                 # Documentation
├── LICENSE                   # MIT License
├── CHANGELOG.md              # Version history
├── CONTRIBUTING.md           # Contribution guidelines
├── .gitignore                # Git ignore file
├── .npmignore                # npm ignore file
├── .gitattributes            # Git attributes configuration
├── .npmrc                    # npm configuration
├── checkpoint.md             # Progress tracking
└── claude.md                 # This file
```

## Features

1. **Type-Safe API**: Complete TypeScript definitions for all Creatify API endpoints, parameters, and responses.

2. **Easy Authentication**: Simple setup with API ID and key from Creatify account.

3. **Modular Design**: Separate modules for different API areas (Avatar, URL-to-Video, etc.).

4. **Error Handling**: Comprehensive error handling with detailed error information.

5. **Documentation**: Full JSDoc comments with links to Creatify documentation, README with examples, and contributor guidelines.

6. **Helper Utilities**: 
   - VideoCreator for simplified video creation
   - AudioProcessor for text-to-speech operations
   - BatchProcessor for batch processing of API tasks

7. **Examples**: Sample code showing common use cases.

8. **NPM Ready**: Configured for npm publication with proper package structure and configuration.

9. **CI/CD**: GitHub Actions workflow for continuous integration and deployment.

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

3. **Text-to-Speech API**: Convert text to natural-sounding speech:
   - Generate audio from text with various accents
   - Check audio generation status
   - List all audio generation tasks

4. **AI Editing API**: Automated video editing:
   - Submit videos for AI editing
   - Apply different editing styles
   - Check editing status and retrieve results

5. **Custom Templates API**: Create videos using custom templates:
   - Generate videos from templates
   - Customize template parameters
   - Check template rendering status

6. **DYOA API**: Design Your Own Avatar:
   - Create custom avatar descriptions
   - Review and approve generated avatars
   - Manage DYOA tasks

7. **Utilities**: Helper classes for common tasks:
   - VideoCreator for simplified video creation
   - AudioProcessor for text-to-speech operations
   - BatchProcessor for handling multiple API tasks
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

### Creating Multi-Avatar Conversations:

```typescript
import { VideoCreator } from 'creatify-api-ts/utils';

// Initialize the VideoCreator
const videoCreator = new VideoCreator('your-api-id', 'your-api-key');

// Create a conversation with multiple avatars
const result = await videoCreator.createConversation({
  conversation: [
    {
      avatarName: 'John',  // Find by name
      voiceName: 'English Male',
      text: "Hello! How are you today?"
    },
    {
      avatarName: 'Maria',  // Find by name
      voiceName: 'English Female',
      text: "I'm doing well, thank you! How about you?"
    },
    {
      avatarName: 'John',  // Same avatar for continuity
      voiceName: 'English Male',
      text: "I'm great! Just demonstrating the Creatify API."
    }
  ],
  backgroundUrl: "https://example.com/my-background.jpg",  // Optional
  aspectRatio: "16:9"
});

console.log(`Conversation video created! URL: ${result.url}`);
```

## Installation

The package is available on npm and can be installed with:

```bash
npm install creatify-api-ts
```

Or using yarn:

```bash
yarn add creatify-api-ts
```

## Development

The project is set up with:
- TypeScript for type-safe development
- tsup for simplified building
- Vitest for testing
- ESM and CommonJS module output
- Source maps for debugging
- GitHub Actions for CI/CD

To build the project:

```bash
npm run build
```

To run tests:

```bash
npm test
```

To watch for changes during development:

```bash
npm run dev
```

## Status

The library is fully implemented, documented, and ready for production use. It is available on GitHub at https://github.com/TSavo/creatify-api-ts and can be installed via npm.

Current version: **1.0.0**

## Notes

- A Creatify account with API access (Pro or Enterprise plan) is required to use this library.
- API credentials can be found in Workspace Settings → Settings → API in your Creatify account.