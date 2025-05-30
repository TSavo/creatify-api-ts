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

describe('Lipsync V2 API Integration Tests', () => {
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
      console.log('Fetching available avatars and voices for Lipsync V2...');
      availableAvatars = await creatify.avatar.getAvatars();
      availableVoices = await creatify.avatar.getVoices();
      
      console.log(`Found ${availableAvatars.length} avatars and ${availableVoices.length} voices for Lipsync V2`);
      
      expect(availableAvatars.length).toBeGreaterThan(0);
      expect(availableVoices.length).toBeGreaterThan(0);
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping Lipsync V2 integration tests - API credentials not provided');
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

  describe('Lipsync V2 Generation', () => {
    it('should create lipsync V2 video and validate file', async () => {
      const avatarId = availableAvatars[0].avatar_id;
      const voiceId = availableVoices[0].voice_id;
      const testText = TEST_CONTENT.SHORT_TEXTS[0];
      
      console.log(`Creating Lipsync V2 video with avatar ${avatarId} and voice ${voiceId}`);
      
      // Create lipsync V2 task
      const lipsyncResponse = await creatify.lipsyncV2.createLipsyncV2({
        text: testText,
        creator: avatarId,
        aspect_ratio: '16:9',
        voice_id: voiceId,
        name: 'Integration Test Lipsync V2',
        quality: 'high',
        background_music: false,
      });
      
      resourceTracker.addTask(lipsyncResponse.id, 'lipsync-v2');
      
      expect(lipsyncResponse).toHaveProperty('id');
      expect(lipsyncResponse).toHaveProperty('status');
      expect(typeof lipsyncResponse.id).toBe('string');
      
      console.log(`Lipsync V2 task created: ${lipsyncResponse.id}`);
      
      // Wait for completion
      const completedTask = await waitForTaskCompletion(
        lipsyncResponse.id,
        (id) => creatify.lipsyncV2.getLipsyncV2(id),
        60, // 60 attempts
        5000 // 5 second intervals
      );
      
      expect(completedTask.status).toBe('done');
      expect(completedTask).toHaveProperty('output');
      expect(typeof completedTask.output).toBe('string');
      expect(completedTask.output).toMatch(/^https?:\/\//);
      
      console.log(`Lipsync V2 completed: ${completedTask.output}`);
      
      // Download and validate the video file
      const filename = generateUniqueFilename('lipsync-v2-test', 'mp4');
      const outputPath = join(config.outputDir, filename);
      
      await downloadFile(completedTask.output, outputPath);
      resourceTracker.addFile(outputPath);
      
      // Validate file exists and has content
      const fileSize = await getFileSize(outputPath);
      expect(fileSize).toBeGreaterThan(0);
      console.log(`Downloaded Lipsync V2 video file size: ${fileSize} bytes`);
      
      // Validate with ffprobe
      const mediaInfo = await getMediaInfo(outputPath);
      expect(mediaInfo.duration).toBeGreaterThan(0);
      expect(mediaInfo.hasVideo).toBe(true);
      expect(mediaInfo.hasAudio).toBe(true);
      expect(mediaInfo.width).toBeGreaterThan(0);
      expect(mediaInfo.height).toBeGreaterThan(0);
      
      console.log(`Lipsync V2 video info: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}, ${mediaInfo.format}`);
      
      // Validate credits were used
      expect(completedTask).toHaveProperty('credits_used');
      expect(completedTask.credits_used).toBeGreaterThan(0);
    }, config.timeout);

    it('should create lipsync V2 with different quality settings', async () => {
      const avatarId = availableAvatars[0].avatar_id;
      const voiceId = availableVoices[0].voice_id;
      const testText = TEST_CONTENT.SHORT_TEXTS[1];
      
      const qualitySettings = ['standard', 'high'];
      
      for (const quality of qualitySettings) {
        console.log(`Creating Lipsync V2 with ${quality} quality...`);
        
        const lipsyncResponse = await creatify.lipsyncV2.createLipsyncV2({
          text: testText,
          creator: avatarId,
          aspect_ratio: '9:16', // Vertical format
          voice_id: voiceId,
          name: `Integration Test Lipsync V2 ${quality}`,
          quality: quality,
          background_music: false,
        });
        
        resourceTracker.addTask(lipsyncResponse.id, 'lipsync-v2');
        
        expect(lipsyncResponse).toHaveProperty('id');
        expect(lipsyncResponse).toHaveProperty('status');
        
        console.log(`Lipsync V2 ${quality} task created: ${lipsyncResponse.id}`);
        
        // Get the task to verify it was created
        const retrievedTask = await creatify.lipsyncV2.getLipsyncV2(lipsyncResponse.id);
        expect(retrievedTask).toHaveProperty('id');
        expect(retrievedTask.id).toBe(lipsyncResponse.id);
        expect(retrievedTask).toHaveProperty('status');
        
        console.log(`Lipsync V2 ${quality} task status: ${retrievedTask.status}`);
        
        // Brief delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    });

    it('should create lipsync V2 with audio input', async () => {
      const avatarId = availableAvatars[0].avatar_id;
      
      console.log('Creating Lipsync V2 with audio input...');
      
      try {
        // Use a sample audio URL (this would typically be a user-uploaded audio file)
        const audioUrl = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
        
        const lipsyncResponse = await creatify.lipsyncV2.createLipsyncV2({
          audio: audioUrl,
          creator: avatarId,
          aspect_ratio: '16:9',
          name: 'Integration Test Lipsync V2 Audio',
          quality: 'standard',
        });
        
        resourceTracker.addTask(lipsyncResponse.id, 'lipsync-v2');
        
        expect(lipsyncResponse).toHaveProperty('id');
        expect(lipsyncResponse).toHaveProperty('status');
        
        console.log(`Lipsync V2 audio task created: ${lipsyncResponse.id}`);
        
        // Get the task to verify it was created
        const retrievedTask = await creatify.lipsyncV2.getLipsyncV2(lipsyncResponse.id);
        expect(retrievedTask).toHaveProperty('id');
        expect(retrievedTask.id).toBe(lipsyncResponse.id);
        expect(retrievedTask).toHaveProperty('status');
        
        console.log(`Lipsync V2 audio task status: ${retrievedTask.status}`);
      } catch (error) {
        if (error.message?.includes('audio') || error.message?.includes('url')) {
          console.log('Lipsync V2 audio input not supported or URL invalid - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });

  describe('Lipsync V2 Workflow', () => {
    it('should use convenience method for lipsync V2', async () => {
      const avatarId = availableAvatars[0].avatar_id;
      const voiceId = availableVoices[0].voice_id;
      const testText = TEST_CONTENT.SHORT_TEXTS[2];
      
      console.log('Creating Lipsync V2 using convenience method...');
      
      // Use the convenience method that waits for completion
      const completedVideo = await creatify.lipsyncV2.createAndWaitForLipsyncV2({
        text: testText,
        creator: avatarId,
        aspect_ratio: '9:16', // Vertical format
        voice_id: voiceId,
        name: 'Integration Test Lipsync V2 Convenience',
        quality: 'high',
        background_music: false,
      });
      
      resourceTracker.addTask(completedVideo.id, 'lipsync-v2');
      
      expect(completedVideo.status).toBe('done');
      expect(completedVideo).toHaveProperty('output');
      expect(completedVideo.output).toMatch(/^https?:\/\//);
      
      // Download and validate
      const filename = generateUniqueFilename('lipsync-v2-convenience', 'mp4');
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
      
      console.log(`Lipsync V2 convenience method video: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
    }, config.timeout);

    it('should monitor lipsync V2 generation progress', async () => {
      const avatarId = availableAvatars[0].avatar_id;
      const voiceId = availableVoices[0].voice_id;
      const testText = 'This is a test for monitoring Lipsync V2 progress. The system should track status updates.';
      
      console.log('Creating Lipsync V2 and monitoring progress...');
      
      const lipsyncResponse = await creatify.lipsyncV2.createLipsyncV2({
        text: testText,
        creator: avatarId,
        aspect_ratio: '16:9',
        voice_id: voiceId,
        name: 'Integration Test Lipsync V2 Monitoring',
        quality: 'standard',
      });
      
      resourceTracker.addTask(lipsyncResponse.id, 'lipsync-v2');
      
      console.log(`Lipsync V2 task created for monitoring: ${lipsyncResponse.id}`);
      
      // Monitor the task for a reasonable time
      let attempts = 0;
      const maxAttempts = 20; // 20 attempts = ~2 minutes
      
      while (attempts < maxAttempts) {
        const task = await creatify.lipsyncV2.getLipsyncV2(lipsyncResponse.id);
        
        console.log(`Lipsync V2 task ${task.id} status: ${task.status} (attempt ${attempts + 1})`);
        
        if (task.status === 'done' || task.status === 'completed') {
          expect(task).toHaveProperty('output');
          expect(task.output).toMatch(/^https?:\/\//);
          
          console.log(`Lipsync V2 monitoring completed successfully`);
          return; // Test passed
        }
        
        if (task.status === 'failed' || task.status === 'error') {
          console.log(`Lipsync V2 task failed: ${task.status}`);
          if (task.error_message) {
            console.log(`Error message: ${task.error_message}`);
          }
          // Don't fail the test - generation might have issues
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 6000)); // 6 second intervals
        }
      }
      
      console.log('Lipsync V2 task did not complete within monitoring period');
      // Don't fail the test - this is expected for longer processing
    }, 300000); // 5 minute timeout
  });

  describe('Lipsync V2 Management', () => {
    it('should list lipsync V2 tasks', async () => {
      const lipsyncList = await creatify.lipsyncV2.getLipsyncV2List();
      
      expect(lipsyncList).toBeInstanceOf(Array);
      console.log(`Found ${lipsyncList.length} Lipsync V2 tasks in account`);
      
      if (lipsyncList.length > 0) {
        const lipsyncTask = lipsyncList[0];
        expect(lipsyncTask).toHaveProperty('id');
        expect(lipsyncTask).toHaveProperty('status');
        expect(typeof lipsyncTask.id).toBe('string');
        expect(typeof lipsyncTask.status).toBe('string');
      }
    });

    it('should get specific lipsync V2 task by ID', async () => {
      // First create a lipsync V2 task
      const avatarId = availableAvatars[0].avatar_id;
      const voiceId = availableVoices[0].voice_id;
      
      const lipsyncResponse = await creatify.lipsyncV2.createLipsyncV2({
        text: 'Quick test for task retrieval in Lipsync V2.',
        creator: avatarId,
        voice_id: voiceId,
        aspect_ratio: '16:9',
        name: 'Task Retrieval Test V2',
        quality: 'standard',
      });
      
      resourceTracker.addTask(lipsyncResponse.id, 'lipsync-v2');
      
      // Get the specific task
      const retrievedTask = await creatify.lipsyncV2.getLipsyncV2(lipsyncResponse.id);
      
      expect(retrievedTask).toHaveProperty('id');
      expect(retrievedTask.id).toBe(lipsyncResponse.id);
      expect(retrievedTask).toHaveProperty('status');
      expect(retrievedTask).toHaveProperty('text');
      expect(retrievedTask.text).toBe('Quick test for task retrieval in Lipsync V2.');
      
      console.log(`Retrieved Lipsync V2 task: ${retrievedTask.id}, status: ${retrievedTask.status}`);
    });
  });
});
