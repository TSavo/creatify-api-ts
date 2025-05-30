import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { join } from 'path';
import { Creatify } from '../../src';
import {
  getIntegrationConfig,
  ensureOutputDir,
  downloadFile,
  getFileSize,
  getMediaInfo,
  waitForTaskCompletion,
  generateUniqueFilename,
  TestResourceTracker,
  TEST_CONTENT,
} from './setup';

describe('Avatar API Integration Tests', () => {
  let creatify: Creatify;
  let config: ReturnType<typeof getIntegrationConfig>;
  let resourceTracker: TestResourceTracker;
  let availableAvatars: any[];
  let availableVoices: any[];

  beforeAll(async () => {
    try {
      config = getIntegrationConfig();
      await ensureOutputDir(config.outputDir);
      
      creatify = new Creatify({
        apiId: config.apiId,
        apiKey: config.apiKey,
      });

      // Get available avatars and voices for tests
      console.log('Fetching available avatars and voices...');
      availableAvatars = await creatify.avatar.getAvatars();
      availableVoices = await creatify.avatar.getVoices();
      
      console.log(`Found ${availableAvatars.length} avatars and ${availableVoices.length} voices`);
      
      expect(availableAvatars.length).toBeGreaterThan(0);
      expect(availableVoices.length).toBeGreaterThan(0);
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping integration tests - API credentials not provided');
        return;
      }
      throw error;
    }
  }, 30000);

  beforeEach(() => {
    resourceTracker = new TestResourceTracker();
  });

  afterAll(async () => {
    if (resourceTracker) {
      await resourceTracker.cleanup();
    }
  });

  describe('Avatar and Voice Retrieval', () => {
    it('should fetch avatars with proper structure', async () => {
      const avatars = await creatify.avatar.getAvatars();
      
      expect(avatars).toBeInstanceOf(Array);
      expect(avatars.length).toBeGreaterThan(0);
      
      const avatar = avatars[0];
      expect(avatar).toHaveProperty('avatar_id');
      expect(avatar).toHaveProperty('name');
      expect(typeof avatar.avatar_id).toBe('string');
      expect(typeof avatar.name).toBe('string');
    });

    it('should fetch voices with proper structure', async () => {
      const voices = await creatify.avatar.getVoices();
      
      expect(voices).toBeInstanceOf(Array);
      expect(voices.length).toBeGreaterThan(0);
      
      const voice = voices[0];
      expect(voice).toHaveProperty('voice_id');
      expect(voice).toHaveProperty('name');
      expect(typeof voice.voice_id).toBe('string');
      expect(typeof voice.name).toBe('string');
    });
  });

  describe('Lipsync Video Creation', () => {
    it('should create a short lipsync video and validate file', async () => {
      const avatarId = availableAvatars[0].avatar_id;
      const voiceId = availableVoices[0].voice_id;
      const testText = TEST_CONTENT.SHORT_TEXTS[0];
      
      console.log(`Creating lipsync video with avatar ${avatarId} and voice ${voiceId}`);
      
      // Create lipsync task
      const lipsyncResponse = await creatify.avatar.createLipsync({
        text: testText,
        creator: avatarId,
        aspect_ratio: '16:9',
        voice_id: voiceId,
        name: 'Integration Test Video',
      });
      
      resourceTracker.addTask(lipsyncResponse.id, 'lipsync');
      
      expect(lipsyncResponse).toHaveProperty('id');
      expect(lipsyncResponse).toHaveProperty('status');
      expect(typeof lipsyncResponse.id).toBe('string');
      
      console.log(`Lipsync task created: ${lipsyncResponse.id}`);
      
      // Wait for completion
      const completedTask = await waitForTaskCompletion(
        lipsyncResponse.id,
        (id) => creatify.avatar.getLipsync(id),
        60, // 60 attempts
        5000 // 5 second intervals
      );
      
      expect(completedTask.status).toBe('done');
      expect(completedTask).toHaveProperty('output');
      expect(typeof completedTask.output).toBe('string');
      expect(completedTask.output).toMatch(/^https?:\/\//);
      
      console.log(`Video completed: ${completedTask.output}`);
      
      // Download and validate the video file
      const filename = generateUniqueFilename('lipsync-test', 'mp4');
      const outputPath = join(config.outputDir, filename);
      
      await downloadFile(completedTask.output, outputPath);
      resourceTracker.addFile(outputPath);
      
      // Validate file exists and has content
      const fileSize = await getFileSize(outputPath);
      expect(fileSize).toBeGreaterThan(0);
      console.log(`Downloaded video file size: ${fileSize} bytes`);
      
      // Validate with ffprobe
      const mediaInfo = await getMediaInfo(outputPath);
      expect(mediaInfo.duration).toBeGreaterThan(0);
      expect(mediaInfo.hasVideo).toBe(true);
      expect(mediaInfo.hasAudio).toBe(true);
      expect(mediaInfo.width).toBeGreaterThan(0);
      expect(mediaInfo.height).toBeGreaterThan(0);
      
      console.log(`Video info: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}, ${mediaInfo.format}`);
      
      // Validate credits were used
      expect(completedTask).toHaveProperty('credits_used');
      expect(completedTask.credits_used).toBeGreaterThan(0);
    }, config.timeout);

    it('should create lipsync video using convenience method', async () => {
      const avatarId = availableAvatars[0].avatar_id;
      const voiceId = availableVoices[0].voice_id;
      const testText = TEST_CONTENT.SHORT_TEXTS[1];
      
      console.log('Creating lipsync video using convenience method...');
      
      // Use the convenience method that waits for completion
      const completedVideo = await creatify.avatar.createAndWaitForLipsync({
        text: testText,
        creator: avatarId,
        aspect_ratio: '9:16', // Vertical format
        voice_id: voiceId,
        name: 'Integration Test Convenience',
      });
      
      resourceTracker.addTask(completedVideo.id, 'lipsync');
      
      expect(completedVideo.status).toBe('done');
      expect(completedVideo).toHaveProperty('output');
      expect(completedVideo.output).toMatch(/^https?:\/\//);
      
      // Download and validate
      const filename = generateUniqueFilename('lipsync-convenience', 'mp4');
      const outputPath = join(config.outputDir, filename);
      
      await downloadFile(completedVideo.output, outputPath);
      resourceTracker.addFile(outputPath);
      
      const fileSize = await getFileSize(outputPath);
      expect(fileSize).toBeGreaterThan(0);
      
      const mediaInfo = await getMediaInfo(outputPath);
      expect(mediaInfo.duration).toBeGreaterThan(0);
      expect(mediaInfo.hasVideo).toBe(true);
      expect(mediaInfo.hasAudio).toBe(true);
      
      // Verify vertical aspect ratio (9:16)
      expect(mediaInfo.height).toBeGreaterThan(mediaInfo.width);
      
      console.log(`Convenience method video: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
    }, config.timeout);
  });
});
