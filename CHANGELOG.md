# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-05-23

### Added
- Added proper TypeScript type definitions for all API responses and parameters
- Added Voice interface to TextToSpeech namespace
- Added separate type files for better organization

### Changed
- Improved type safety by replacing `any` types with more specific types
- Fixed error handling in video-creator.ts to properly handle unknown error types
- Converted `let` variables to `const` when they were never reassigned
- Fixed unused variables by prefixing them with an underscore
- Updated client methods to accept generic data types

### Fixed
- Fixed TypeScript errors in batch-processor.ts
- Fixed namespace issues in types/index.ts
- Fixed error handling in video-creator.ts

## [0.0.1] - 2025-05-20

### Added
- Updated contact information for open source release
- Improved documentation with troubleshooting section
- Added security best practices section
- Added API version compatibility information
- Added CODE_OF_CONDUCT.md

### Fixed
- Updated NPM registry configuration
- Fixed type definitions for voice information

## [1.0.0] - 2025-05-17

### Added
- Initial stable release of the Creatify API TypeScript client
- Complete TypeScript definitions for all API endpoints, parameters, and responses
- Comprehensive documentation with examples
- Avatar API support for creating AI avatar videos
- URL-to-Video API support for converting web content to videos
- Text-to-Speech API support for generating audio from text
- AI Editing API support for automated video editing
- Custom Templates API support for creating videos with templates
- DYOA (Design Your Own Avatar) API support for designing custom avatars
- VideoCreator utility for simplified video creation
- AudioProcessor utility for audio generation
- BatchProcessor utility for handling multiple API tasks
- GitHub Actions workflow for CI/CD
- NPM publishing configuration

## [0.1.0] - 2025-05-17

### Added
- Initial release of the Creatify API TypeScript client
- Avatar API support for creating AI avatar videos
- URL-to-Video API support for converting web content to videos
- Text-to-Speech API support for generating audio from text
- AI Editing API support for automated video editing
- Custom Templates API support for creating videos with templates
- DYOA (Design Your Own Avatar) API support for designing custom avatars
- VideoCreator utility for simplified video creation
- AudioProcessor utility for audio generation
- BatchProcessor utility for handling multiple API tasks
- Comprehensive TypeScript types for all API parameters and responses
- Full test suite with Vitest
