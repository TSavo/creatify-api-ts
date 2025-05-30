# Creatify API Integration Tests

This directory contains comprehensive integration tests for the Creatify API TypeScript client. These tests make real API calls to validate the functionality of all major endpoints with **full file validation including ffprobe analysis**.

## 🚀 Quick Start

### Prerequisites

1. **FFmpeg**: Required for video/audio file validation
   ```bash
   # macOS
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   ```

2. **API Credentials**: Get your credentials from [Creatify](https://video.creatify.ai/)
   - Go to Settings → API
   - Copy your X-API-ID and X-API-KEY

### Setup

1. **Configure Environment Variables**:
   ```bash
   # Copy the example file
   cp .env.integration.example .env.integration
   
   # Edit with your actual credentials
   CREATIFY_API_ID=your-api-id-here
   CREATIFY_API_KEY=your-api-key-here
   ```

2. **Run Integration Tests**:
   ```bash
   # Run all integration tests
   npm run test:integration
   
   # Run with watch mode
   npm run test:integration:watch
   
   # Run specific test file
   npx vitest run tests/integration/avatar.integration.test.ts --config vitest.integration.config.ts
   ```

## 🧪 What Gets Tested

### Comprehensive Validation Pipeline

Each test performs the following validations:

1. **API Response Validation**
   - ✅ Correct response structure
   - ✅ Required fields present
   - ✅ Proper data types

2. **Task Completion Monitoring**
   - ✅ Polling for task completion
   - ✅ Status transitions
   - ✅ Error handling

3. **File Download & Validation**
   - ✅ Download generated videos/audio
   - ✅ File size > 0 bytes
   - ✅ File exists on disk

4. **Media File Analysis (ffprobe)**
   - ✅ Duration > 0 seconds
   - ✅ Video/audio streams present
   - ✅ Resolution validation (width/height > 0)
   - ✅ Format verification
   - ✅ Bitrate analysis
   - ✅ Aspect ratio validation

### Example Test Flow

```typescript
// 1. Create task
const response = await creatify.avatar.createLipsync({
  text: "The quick brown fox jumped over the lazy dog.",
  creator: avatarId,
  aspect_ratio: "16:9"
});

// 2. Wait for completion
const completed = await waitForTaskCompletion(response.id, ...);

// 3. Download file
await downloadFile(completed.output, localPath);

// 4. Validate file exists and has content
const fileSize = await getFileSize(localPath);
expect(fileSize).toBeGreaterThan(0);

// 5. Analyze with ffprobe
const mediaInfo = await getMediaInfo(localPath);
expect(mediaInfo.duration).toBeGreaterThan(0);
expect(mediaInfo.hasVideo).toBe(true);
expect(mediaInfo.hasAudio).toBe(true);
expect(mediaInfo.width).toBeGreaterThan(0);
expect(mediaInfo.height).toBeGreaterThan(0);
```

## 📁 Test Structure

### Complete Test Files ✅

- **`avatar.integration.test.ts`** - Avatar API tests (lipsync videos, multi-avatar conversations)
- **`text-to-speech.integration.test.ts`** - Text-to-Speech API tests with audio validation
- **`url-to-video.integration.test.ts`** - URL-to-Video conversion tests with video validation
- **`ai-editing.integration.test.ts`** - AI video editing tests with video validation
- **`custom-templates.integration.test.ts`** - Custom template video tests with validation
- **`dyoa.integration.test.ts`** - Design Your Own Avatar tests with image validation
- **`ai-scripts.integration.test.ts`** - AI script generation tests with content validation
- **`ai-shorts.integration.test.ts`** - AI shorts video tests with video validation
- **`lipsync-v2.integration.test.ts`** - Lipsync V2 API tests with enhanced video validation
- **`musics.integration.test.ts`** - Music library tests with audio file validation
- **`workspace.integration.test.ts`** - Workspace management and billing tests
- **`setup.ts`** - Test utilities and configuration

## ⚙️ Configuration

### Environment Variables

```bash
# Required
CREATIFY_API_ID=your-api-id
CREATIFY_API_KEY=your-api-key

# Optional
CREATIFY_BASE_URL=https://api.creatify.ai
CREATIFY_TIMEOUT=30000
TEST_TIMEOUT=600000
TEST_OUTPUT_DIR=tests/integration/output
KEEP_TEST_FILES=false
API_RATE_LIMIT_DELAY=1000
```

### Test Configuration

- **Timeouts**: 10 minutes for video generation, 5 minutes for audio
- **Rate Limiting**: Sequential execution to avoid API rate limits
- **Retry Logic**: 1 retry for failed tests
- **File Cleanup**: Automatic cleanup of downloaded files after tests
- **FFprobe Validation**: Full media analysis for every generated file

## 📊 Test Content Strategy

All tests use minimal content to reduce credit usage:

### Text Content (3 sentences max)
- "The quick brown fox jumped over the lazy dog. This is a test video. Thank you for watching."
- "Hello world! This is integration testing. All systems working perfectly."
- "Testing API functionality. Short and sweet content. Integration test complete."

### Video Settings
- **Duration**: 15-30 seconds maximum
- **Aspect Ratios**: 16:9, 9:16 (vertical)
- **Quality**: Standard settings to minimize processing time

## 🔍 FFprobe Validation

Every generated media file is analyzed with ffprobe to ensure:

### Video Files
- Duration > 0 seconds
- Has video stream
- Has audio stream  
- Width > 0 pixels
- Height > 0 pixels
- Valid format (mp4, etc.)
- Bitrate information

### Audio Files
- Duration > 0 seconds
- Has audio stream
- No video stream
- Valid format (mp3, etc.)
- Bitrate information

### Aspect Ratio Validation
- 16:9 videos: width > height
- 9:16 videos: height > width
- Proper resolution values

## 🚨 Important Notes

- **API Credits**: These tests consume real API credits
- **Processing Time**: Video generation can take several minutes
- **Rate Limits**: Tests run sequentially to respect API limits
- **File Storage**: Downloaded files are automatically cleaned up
- **Network Required**: Tests require internet connection to Creatify API
- **FFmpeg Required**: ffprobe must be installed for media validation

## 🎯 Ready to Test?

When you have your API credentials and FFmpeg installed:

```bash
# Set up your credentials
cp .env.integration.example .env.integration
# Edit .env.integration with your actual API keys

# Run the tests
npm run test:integration
```

The tests will create real videos, download them, and validate them with ffprobe to ensure your API integration is working perfectly! 🎉

## 🎯 Complete Test Coverage (11/11 APIs)

### Avatar API ✅
- Get avatars and voices
- Create lipsync videos
- Multi-avatar conversations
- Convenience methods
- File validation with ffprobe

### Text-to-Speech API ✅
- Generate audio from text
- Different voice options
- Task management
- Audio file validation with ffprobe

### URL-to-Video API ✅
- Link creation and management
- Video generation from URLs
- Different visual/script styles
- Link updates
- Video file validation with ffprobe

### AI Editing API ✅
- Task creation and monitoring
- Different editing styles
- Preview generation
- Video validation with ffprobe

### Custom Templates API ✅
- Template discovery
- Product/real estate templates
- Preview and render workflow
- Template video validation with ffprobe

### DYOA (Design Your Own Avatar) API ✅
- Avatar creation requests
- Photo generation monitoring
- Photo selection workflow
- Image file validation

### AI Scripts API ✅
- Script generation from prompts
- Different tones and audiences
- Content length validation
- Script quality assessment

### AI Shorts API ✅
- Short video generation
- Different styles and formats
- Vertical video validation
- Preview and render workflow

### Lipsync V2 API ✅
- Enhanced lipsync generation
- Quality settings (standard/high)
- Audio input support
- Advanced video validation

### Musics API ✅
- Music library browsing
- Genre and mood filtering
- Audio file download and validation
- Search functionality

### Workspace API ✅
- Workspace information
- Usage statistics
- Billing information
- API key management
