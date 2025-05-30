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

describe('Text-to-Speech API Integration Tests', () => {
  let creatify: Creatify;
  let config: ReturnType<typeof getIntegrationConfig>;
  let resourceTracker: TestResourceTracker;
  let availableVoices: any[];

  beforeAll(async () => {
    try {
      config = getIntegrationConfig();
      await ensureOutputDir(config.outputDir);
      
      creatify = new Creatify({
        apiId: config.apiId,
        apiKey: config.apiKey,
      });

      // Get available voices for tests
      console.log('Fetching available voices for TTS...');
      availableVoices = await creatify.avatar.getVoices();
      
      console.log(`Found ${availableVoices.length} voices for TTS`);
      expect(availableVoices.length).toBeGreaterThan(0);
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping TTS integration tests - API credentials not provided');
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

  describe('Text-to-Speech Generation', () => {
    it('should create TTS audio and validate file', async () => {
      const voiceId = availableVoices[0].voice_id;
      const testScript = TEST_CONTENT.SHORT_TEXTS[0];
      
      console.log(`Creating TTS with voice ${voiceId}`);
      
      // Create TTS task
      const ttsResponse = await creatify.textToSpeech.createTextToSpeech({
        script: testScript,
        accent: voiceId,
        name: 'Integration Test TTS',
      });
      
      resourceTracker.addTask(ttsResponse.id, 'tts');
      
      expect(ttsResponse).toHaveProperty('id');
      expect(ttsResponse).toHaveProperty('status');
      expect(typeof ttsResponse.id).toBe('string');
      
      console.log(`TTS task created: ${ttsResponse.id}`);
      
      // Wait for completion
      const completedTask = await waitForTaskCompletion(
        ttsResponse.id,
        (id) => creatify.textToSpeech.getTextToSpeech(id),
        30, // TTS should be faster than video
        3000 // 3 second intervals
      );
      
      expect(completedTask.status).toBe('done');
      expect(completedTask).toHaveProperty('output');
      expect(typeof completedTask.output).toBe('string');
      expect(completedTask.output).toMatch(/^https?:\/\//);
      
      console.log(`TTS completed: ${completedTask.output}`);
      
      // Download and validate the audio file
      const filename = generateUniqueFilename('tts-test', 'mp3');
      const outputPath = join(config.outputDir, filename);
      
      await downloadFile(completedTask.output, outputPath);
      resourceTracker.addFile(outputPath);
      
      // Validate file exists and has content
      const fileSize = await getFileSize(outputPath);
      expect(fileSize).toBeGreaterThan(0);
      console.log(`Downloaded audio file size: ${fileSize} bytes`);
      
      // Validate with ffprobe
      const mediaInfo = await getMediaInfo(outputPath);
      expect(mediaInfo.duration).toBeGreaterThan(0);
      expect(mediaInfo.hasAudio).toBe(true);
      expect(mediaInfo.hasVideo).toBe(false); // Audio only
      
      console.log(`Audio info: ${mediaInfo.duration}s, ${mediaInfo.format}, bitrate: ${mediaInfo.bitrate}`);
      
      // Validate credits were used
      expect(completedTask).toHaveProperty('credits_used');
      expect(completedTask.credits_used).toBeGreaterThan(0);
    }, config.timeout);

    it('should create TTS using convenience method', async () => {
      const voiceId = availableVoices[0].voice_id;
      const testScript = TEST_CONTENT.SHORT_TEXTS[1];
      
      console.log('Creating TTS using convenience method...');
      
      // Use the convenience method that waits for completion
      const completedTts = await creatify.textToSpeech.createAndWaitForTextToSpeech({
        script: testScript,
        accent: voiceId,
        name: 'Integration Test TTS Convenience',
      });
      
      resourceTracker.addTask(completedTts.id, 'tts');
      
      expect(completedTts.status).toBe('done');
      expect(completedTts).toHaveProperty('output');
      expect(completedTts.output).toMatch(/^https?:\/\//);
      
      // Download and validate
      const filename = generateUniqueFilename('tts-convenience', 'mp3');
      const outputPath = join(config.outputDir, filename);
      
      await downloadFile(completedTts.output, outputPath);
      resourceTracker.addFile(outputPath);
      
      const fileSize = await getFileSize(outputPath);
      expect(fileSize).toBeGreaterThan(0);
      
      const mediaInfo = await getMediaInfo(outputPath);
      expect(mediaInfo.duration).toBeGreaterThan(0);
      expect(mediaInfo.hasAudio).toBe(true);
      expect(mediaInfo.hasVideo).toBe(false);
      
      console.log(`Convenience TTS: ${mediaInfo.duration}s, ${mediaInfo.format}`);
    }, config.timeout);

    it('should handle different voice options', async () => {
      if (availableVoices.length < 2) {
        console.log('Skipping voice variation test - need at least 2 voices');
        return;
      }
      
      const voice1 = availableVoices[0];
      const voice2 = availableVoices[1];
      const testScript = TEST_CONTENT.SHORT_TEXTS[2];
      
      console.log(`Testing different voices: ${voice1.name} vs ${voice2.name}`);
      
      // Create TTS with first voice
      const tts1 = await creatify.textToSpeech.createAndWaitForTextToSpeech({
        script: testScript,
        accent: voice1.voice_id,
        name: `TTS Voice Test - ${voice1.name}`,
      });
      
      resourceTracker.addTask(tts1.id, 'tts');
      
      // Create TTS with second voice
      const tts2 = await creatify.textToSpeech.createAndWaitForTextToSpeech({
        script: testScript,
        accent: voice2.voice_id,
        name: `TTS Voice Test - ${voice2.name}`,
      });
      
      resourceTracker.addTask(tts2.id, 'tts');
      
      // Both should complete successfully
      expect(tts1.status).toBe('done');
      expect(tts2.status).toBe('done');
      expect(tts1.output).toMatch(/^https?:\/\//);
      expect(tts2.output).toMatch(/^https?:\/\//);
      
      // Download both files
      const filename1 = generateUniqueFilename(`tts-${voice1.name}`, 'mp3');
      const filename2 = generateUniqueFilename(`tts-${voice2.name}`, 'mp3');
      const outputPath1 = join(config.outputDir, filename1);
      const outputPath2 = join(config.outputDir, filename2);
      
      await downloadFile(tts1.output, outputPath1);
      await downloadFile(tts2.output, outputPath2);
      resourceTracker.addFile(outputPath1);
      resourceTracker.addFile(outputPath2);
      
      // Validate both files
      const fileSize1 = await getFileSize(outputPath1);
      const fileSize2 = await getFileSize(outputPath2);
      expect(fileSize1).toBeGreaterThan(0);
      expect(fileSize2).toBeGreaterThan(0);
      
      const mediaInfo1 = await getMediaInfo(outputPath1);
      const mediaInfo2 = await getMediaInfo(outputPath2);
      expect(mediaInfo1.duration).toBeGreaterThan(0);
      expect(mediaInfo2.duration).toBeGreaterThan(0);
      expect(mediaInfo1.hasAudio).toBe(true);
      expect(mediaInfo2.hasAudio).toBe(true);
      
      console.log(`Voice 1 (${voice1.name}): ${mediaInfo1.duration}s, ${fileSize1} bytes`);
      console.log(`Voice 2 (${voice2.name}): ${mediaInfo2.duration}s, ${fileSize2} bytes`);
    }, config.timeout);
  });

  describe('TTS Task Management', () => {
    it('should list TTS tasks', async () => {
      const ttsList = await creatify.textToSpeech.getTextToSpeechList();
      
      expect(ttsList).toBeInstanceOf(Array);
      // Should have at least the tasks we created in previous tests
      expect(ttsList.length).toBeGreaterThan(0);
      
      const ttsTask = ttsList[0];
      expect(ttsTask).toHaveProperty('id');
      expect(ttsTask).toHaveProperty('status');
      expect(ttsTask).toHaveProperty('script');
      expect(typeof ttsTask.id).toBe('string');
      expect(typeof ttsTask.status).toBe('string');
      
      console.log(`Found ${ttsList.length} TTS tasks in account`);
    });

    it('should get specific TTS task by ID', async () => {
      // First create a TTS task
      const voiceId = availableVoices[0].voice_id;
      const ttsResponse = await creatify.textToSpeech.createTextToSpeech({
        script: 'Quick test for task retrieval.',
        accent: voiceId,
        name: 'Task Retrieval Test',
      });
      
      resourceTracker.addTask(ttsResponse.id, 'tts');
      
      // Get the specific task
      const retrievedTask = await creatify.textToSpeech.getTextToSpeech(ttsResponse.id);
      
      expect(retrievedTask).toHaveProperty('id');
      expect(retrievedTask.id).toBe(ttsResponse.id);
      expect(retrievedTask).toHaveProperty('status');
      expect(retrievedTask).toHaveProperty('script');
      expect(retrievedTask.script).toBe('Quick test for task retrieval.');
      
      console.log(`Retrieved TTS task: ${retrievedTask.id}, status: ${retrievedTask.status}`);
    });
  });
});
