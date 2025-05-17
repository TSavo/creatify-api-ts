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
│   ├── client.ts             # Base API client
│   └── index.ts              # Main exports
│
├── examples/                 # Example usage
│   └── basic-usage.ts        # Basic examples
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

6. **Examples**: Sample code showing common use cases.

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

## Getting Started

1. Install dependencies and build the library:
   ```bash
   cd C:\Users\T\Projects\creatify-api
   npm install
   npm run build
   ```

2. Try the examples (you'll need to add your Creatify API credentials):
   ```bash
   # First, compile the examples
   npx tsc examples/basic-usage.ts --esModuleInterop
   
   # Then run the example
   node examples/basic-usage.js
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