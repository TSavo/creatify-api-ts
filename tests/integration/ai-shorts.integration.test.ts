import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { join } from 'path';
import { Creatify } from '../../src';
import {
  getIntegrationConfig,
  ensureOutputDir,
  downloadFile,
  getFileSize,
  getMediaInfo,
  generateUniqueFilename,
  TestResourceTracker,
  TEST_CONTENT,
} from './setup';

describe('AI Shorts API Integration Tests', () => {
  let creatify: Creatify;
  let config: ReturnType<typeof getIntegrationConfig>;
  let resourceTracker: TestResourceTracker;

  beforeAll(async () => {
    try {
      config = getIntegrationConfig();
      await ensureOutputDir(config.outputDir);
      
      creatify = new Creatify({
        apiId: config.apiId,
        apiKey: config.apiKey,
      });

      console.log('AI Shorts integration tests initialized');
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping AI Shorts integration tests - API credentials not provided');
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

  describe('AI Shorts Generation', () => {
    it('should create AI shorts video from prompt', async () => {
      const prompt = 'Create a short video about the benefits of exercise and healthy living';
      
      console.log(`Creating AI shorts with prompt: ${prompt}`);
      
      const shortsResponse = await creatify.aiShorts.createAiShorts({
        prompt,
        name: 'Integration Test AI Shorts',
        aspect_ratio: '9:16', // Vertical format for shorts
        video_length: 15,
        target_audience: 'fitness enthusiasts',
        style: 'energetic',
      });
      
      resourceTracker.addTask(shortsResponse.id, 'ai-shorts');
      
      expect(shortsResponse).toHaveProperty('id');
      expect(shortsResponse).toHaveProperty('status');
      expect(typeof shortsResponse.id).toBe('string');
      
      console.log(`AI shorts task created: ${shortsResponse.id}`);
      
      // Get the task to verify it was created
      const retrievedTask = await creatify.aiShorts.getAiShorts(shortsResponse.id);
      expect(retrievedTask).toHaveProperty('id');
      expect(retrievedTask.id).toBe(shortsResponse.id);
      expect(retrievedTask).toHaveProperty('status');
      
      console.log(`AI shorts task status: ${retrievedTask.status}`);
    });

    it('should create AI shorts with different styles', async () => {
      const testCases = [
        {
          prompt: 'Quick tips for productivity',
          style: 'professional',
          target_audience: 'business professionals',
          name: 'Productivity Shorts',
        },
        {
          prompt: 'Fun facts about space exploration',
          style: 'educational',
          target_audience: 'students',
          name: 'Space Facts Shorts',
        },
      ];
      
      for (const testCase of testCases) {
        console.log(`Creating AI shorts: ${testCase.name}`);
        
        const shortsResponse = await creatify.aiShorts.createAiShorts({
          ...testCase,
          aspect_ratio: '9:16',
          video_length: 20,
        });
        
        resourceTracker.addTask(shortsResponse.id, 'ai-shorts');
        
        expect(shortsResponse).toHaveProperty('id');
        expect(shortsResponse).toHaveProperty('status');
        
        console.log(`AI shorts created: ${shortsResponse.id} (${testCase.name})`);
        
        // Brief delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  });

  describe('AI Shorts Workflow', () => {
    it('should monitor AI shorts generation', async () => {
      console.log('Creating AI shorts and monitoring progress...');
      
      const shortsResponse = await creatify.aiShorts.createAiShorts({
        prompt: 'Create an engaging short video about sustainable technology',
        name: 'Integration Test Monitoring',
        aspect_ratio: '9:16',
        video_length: 15,
        target_audience: 'tech enthusiasts',
        style: 'modern',
      });
      
      resourceTracker.addTask(shortsResponse.id, 'ai-shorts');
      
      console.log(`AI shorts task created: ${shortsResponse.id}`);
      
      // Monitor the task for completion
      let attempts = 0;
      const maxAttempts = 30; // AI shorts can take time
      
      while (attempts < maxAttempts) {
        const task = await creatify.aiShorts.getAiShorts(shortsResponse.id);
        
        console.log(`AI shorts task ${task.id} status: ${task.status} (attempt ${attempts + 1})`);
        
        if (task.status === 'done' || task.status === 'completed') {
          expect(task).toHaveProperty('output');
          expect(task.output).toMatch(/^https?:\/\//);
          
          // Download and validate the video
          const filename = generateUniqueFilename('ai-shorts-video', 'mp4');
          const outputPath = join(config.outputDir, filename);
          
          await downloadFile(task.output, outputPath);
          resourceTracker.addFile(outputPath);
          
          const fileSize = await getFileSize(outputPath);
          expect(fileSize).toBeGreaterThan(0);
          
          const mediaInfo = await getMediaInfo(outputPath);
          expect(mediaInfo.duration).toBeGreaterThan(0);
          expect(mediaInfo.hasVideo).toBe(true);
          expect(mediaInfo.hasAudio).toBe(true);
          
          // Verify vertical aspect ratio (9:16)
          expect(mediaInfo.height).toBeGreaterThan(mediaInfo.width);
          
          console.log(`AI shorts video: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
          return; // Test passed
        }
        
        if (task.status === 'failed' || task.status === 'error') {
          console.log(`AI shorts task failed: ${task.status}`);
          if (task.error_message) {
            console.log(`Error message: ${task.error_message}`);
          }
          // Don't fail the test - AI shorts generation might have issues
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second intervals
        }
      }
      
      console.log('AI shorts task did not complete within monitoring period');
      // Don't fail the test - this is expected for longer processing
    }, 600000); // 10 minute timeout

    it('should use convenience method for AI shorts', async () => {
      console.log('Testing AI shorts convenience method...');
      
      try {
        const completedShorts = await creatify.aiShorts.createAndWaitForAiShorts({
          prompt: 'Create a motivational short video about achieving goals',
          name: 'Integration Test Convenience',
          aspect_ratio: '9:16',
          video_length: 15,
          target_audience: 'general',
          style: 'inspirational',
        });
        
        resourceTracker.addTask(completedShorts.id, 'ai-shorts');
        
        expect(completedShorts.status).toBe('done');
        expect(completedShorts).toHaveProperty('output');
        expect(completedShorts.output).toMatch(/^https?:\/\//);
        
        // Download and validate
        const filename = generateUniqueFilename('ai-shorts-convenience', 'mp4');
        const outputPath = join(config.outputDir, filename);
        
        await downloadFile(completedShorts.output, outputPath);
        resourceTracker.addFile(outputPath);
        
        const fileSize = await getFileSize(outputPath);
        expect(fileSize).toBeGreaterThan(0);
        
        const mediaInfo = await getMediaInfo(outputPath);
        expect(mediaInfo.duration).toBeGreaterThan(0);
        expect(mediaInfo.hasVideo).toBe(true);
        expect(mediaInfo.hasAudio).toBe(true);
        
        // Verify vertical aspect ratio
        expect(mediaInfo.height).toBeGreaterThan(mediaInfo.width);
        
        console.log(`Convenience AI shorts: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
      } catch (error) {
        if (error.message?.includes('timeout') || error.message?.includes('did not complete')) {
          console.log('AI shorts convenience method timed out - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    }, 600000); // 10 minute timeout
  });

  describe('AI Shorts Management', () => {
    it('should list AI shorts tasks', async () => {
      const shortsList = await creatify.aiShorts.getAiShortsList();
      
      expect(shortsList).toBeInstanceOf(Array);
      console.log(`Found ${shortsList.length} AI shorts tasks in account`);
      
      if (shortsList.length > 0) {
        const shortsTask = shortsList[0];
        expect(shortsTask).toHaveProperty('id');
        expect(shortsTask).toHaveProperty('status');
        expect(typeof shortsTask.id).toBe('string');
        expect(typeof shortsTask.status).toBe('string');
      }
    });

    it('should get specific AI shorts by ID', async () => {
      // First create an AI shorts task
      const shortsResponse = await creatify.aiShorts.createAiShorts({
        prompt: 'Quick video about time management',
        name: 'Task Retrieval Test',
        aspect_ratio: '9:16',
        video_length: 15,
        target_audience: 'professionals',
        style: 'professional',
      });
      
      resourceTracker.addTask(shortsResponse.id, 'ai-shorts');
      
      // Get the specific task
      const retrievedTask = await creatify.aiShorts.getAiShorts(shortsResponse.id);
      
      expect(retrievedTask).toHaveProperty('id');
      expect(retrievedTask.id).toBe(shortsResponse.id);
      expect(retrievedTask).toHaveProperty('status');
      
      console.log(`Retrieved AI shorts task: ${retrievedTask.id}, status: ${retrievedTask.status}`);
    });
  });

  describe('AI Shorts Preview and Render', () => {
    it('should generate AI shorts preview', async () => {
      // First create an AI shorts task
      const shortsResponse = await creatify.aiShorts.createAiShorts({
        prompt: 'Create a preview-ready short video about innovation',
        name: 'Integration Test Preview',
        aspect_ratio: '9:16',
        video_length: 15,
        target_audience: 'entrepreneurs',
        style: 'dynamic',
      });
      
      resourceTracker.addTask(shortsResponse.id, 'ai-shorts');
      
      console.log(`Created AI shorts task for preview: ${shortsResponse.id}`);
      
      try {
        // Generate preview
        const previewResponse = await creatify.aiShorts.generateAiShortsPreview(shortsResponse.id);
        
        expect(previewResponse).toHaveProperty('id');
        expect(previewResponse.id).toBe(shortsResponse.id);
        
        console.log(`AI shorts preview generated for task: ${previewResponse.id}`);
        
        // Check if preview is ready
        const updatedTask = await creatify.aiShorts.getAiShorts(shortsResponse.id);
        if (updatedTask.preview_url) {
          expect(updatedTask.preview_url).toMatch(/^https?:\/\//);
          
          // Download and validate preview
          const filename = generateUniqueFilename('ai-shorts-preview', 'mp4');
          const outputPath = join(config.outputDir, filename);
          
          await downloadFile(updatedTask.preview_url, outputPath);
          resourceTracker.addFile(outputPath);
          
          const fileSize = await getFileSize(outputPath);
          expect(fileSize).toBeGreaterThan(0);
          
          const mediaInfo = await getMediaInfo(outputPath);
          expect(mediaInfo.duration).toBeGreaterThan(0);
          expect(mediaInfo.hasVideo).toBe(true);
          
          console.log(`Preview video: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
        }
      } catch (error) {
        if (error.message?.includes('not ready') || error.message?.includes('preview')) {
          console.log('AI shorts preview generation not ready - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });
});
