# Creatify API Test Artifacts

This branch contains preserved test videos, audio files, and images generated during integration testing. These files serve as reference examples and validation samples.

## 📁 Directory Structure

```
test-artifacts/
├── videos/           # Generated video files (.mp4)
├── audio/           # Generated audio files (.mp3)
├── images/          # Generated images (.jpg, .png)
├── metadata/        # FFprobe analysis results (.json)
└── reports/         # Test execution reports
```

## 🎬 **Video Samples**

### Avatar API Videos
- `avatar-lipsync-16x9-*.mp4` - Standard lipsync videos (16:9 aspect ratio)
- `avatar-lipsync-9x16-*.mp4` - Vertical lipsync videos (9:16 aspect ratio)
- `avatar-multi-conversation-*.mp4` - Multi-avatar conversation videos

### Lipsync V2 Videos
- `lipsync-v2-standard-*.mp4` - Standard quality lipsync videos
- `lipsync-v2-high-*.mp4` - High quality lipsync videos

### Custom Template Videos
- `template-product-*.mp4` - Product promotion template videos
- `template-real-estate-*.mp4` - Real estate template videos

## 🎵 **Audio Samples**

### Text-to-Speech Audio
- `tts-voice-*-*.mp3` - Generated speech with different voices
- `tts-convenience-*.mp3` - Audio from convenience methods

## 📊 **Metadata Files**

Each media file has a corresponding `.json` file with FFprobe analysis:
- Duration, bitrate, format information
- Video resolution and aspect ratio
- Audio stream details
- File size and creation timestamp

## 🔍 **File Naming Convention**

```
{api}-{type}-{timestamp}.{ext}
{api}-{type}-{timestamp}-metadata.json

Examples:
avatar-lipsync-2024-01-15T10-30-45-123Z.mp4
avatar-lipsync-2024-01-15T10-30-45-123Z-metadata.json
tts-voice-sarah-2024-01-15T10-31-02-456Z.mp3
tts-voice-sarah-2024-01-15T10-31-02-456Z-metadata.json
```

## 🚀 **Usage**

### View Test Artifacts
```bash
# Switch to test artifacts branch
git checkout test-artifacts

# Browse files
ls test-artifacts/videos/
ls test-artifacts/audio/
```

### Add New Test Artifacts
```bash
# After running integration tests with PRESERVE_TEST_FILES=true
npm run test:integration

# Copy generated files to artifacts
cp tests/integration/output/* test-artifacts/videos/

# Commit new artifacts
git add test-artifacts/
git commit -m "Add test artifacts from integration run YYYY-MM-DD"
git push origin test-artifacts
```

### Download Specific Artifacts
```bash
# Download just metadata without large files
git checkout test-artifacts -- test-artifacts/metadata/

# Download specific file types
git checkout test-artifacts -- test-artifacts/videos/avatar-*.mp4
```

## 📈 **Benefits**

- ✅ **Preserved Examples** - Reference videos for API capabilities
- ✅ **Quality Validation** - Visual/audio quality verification
- ✅ **Regression Testing** - Compare new outputs with known good samples
- ✅ **Documentation** - Real examples for API documentation
- ✅ **Debugging** - Investigate issues with actual generated content
- ✅ **Separate from Main** - Doesn't bloat main development branch

## ⚠️ **Important Notes**

- **Large Files**: Video files can be 5-50MB each
- **Git LFS**: Consider using Git LFS for files >10MB
- **Selective Download**: Use sparse checkout to download only needed files
- **Storage Costs**: Be mindful of repository size growth
- **Cleanup**: Periodically remove old artifacts to manage size

## 🔧 **Git LFS Setup** (Optional)

For files larger than 10MB:

```bash
# Install Git LFS
git lfs install

# Track video files
git lfs track "test-artifacts/videos/*.mp4"
git lfs track "test-artifacts/audio/*.mp3"

# Commit LFS configuration
git add .gitattributes
git commit -m "Configure Git LFS for test artifacts"
```

## 📋 **Maintenance**

### Cleanup Old Artifacts
```bash
# Remove artifacts older than 30 days
find test-artifacts/ -name "*.mp4" -mtime +30 -delete
find test-artifacts/ -name "*.mp3" -mtime +30 -delete

# Commit cleanup
git add -A
git commit -m "Clean up old test artifacts"
```

### Archive by Date
```bash
# Create monthly archives
mkdir test-artifacts/archive/2024-01/
mv test-artifacts/videos/*2024-01* test-artifacts/archive/2024-01/
```

---

**This branch preserves valuable test artifacts while keeping the main development branch clean and fast to clone!** 🎬✨
