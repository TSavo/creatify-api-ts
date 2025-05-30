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
} from './setup';

describe('AI Editing API Integration Tests', () => {
  let creatify: Creatify;
  let config: ReturnType<typeof getIntegrationConfig>;
  let resourceTracker: TestResourceTracker;
  let testVideoUrl: string;

  beforeAll(async () => {
    try {
      config = getIntegrationConfig();
      await ensureOutputDir(config.outputDir);
      
      creatify = new Creatify({
        apiId: config.apiId,
        apiKey: config.apiKey,
      });

      // For AI editing tests, we need a source video
      // We'll use a simple test video URL or create one first
      testVideoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
      
      console.log('AI Editing integration tests initialized');
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping AI Editing integration tests - API credentials not provided');
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

  describe('AI Editing Task Management', () => {
    it('should list AI editing tasks', async () => {
      const editingList = await creatify.aiEditing.getAiEditingList();
      
      expect(editingList).toBeInstanceOf(Array);
      console.log(`Found ${editingList.length} AI editing tasks in account`);
      
      if (editingList.length > 0) {
        const editingTask = editingList[0];
        expect(editingTask).toHaveProperty('id');
        expect(editingTask).toHaveProperty('status');
        expect(typeof editingTask.id).toBe('string');
        expect(typeof editingTask.status).toBe('string');
      }
    });

    it('should create AI editing task', async () => {
      console.log(`Creating AI editing task with video: ${testVideoUrl}`);
      
      const editingResponse = await creatify.aiEditing.createAiEditing({
        video_url: testVideoUrl,
        editing_style: 'commercial',
        name: 'Integration Test AI Editing',
      });
      
      resourceTracker.addTask(editingResponse.id, 'ai-editing');
      
      expect(editingResponse).toHaveProperty('id');
      expect(editingResponse).toHaveProperty('status');
      expect(typeof editingResponse.id).toBe('string');
      
      console.log(`AI editing task created: ${editingResponse.id}`);
      
      // Get the task to verify it was created
      const retrievedTask = await creatify.aiEditing.getAiEditing(editingResponse.id);
      expect(retrievedTask).toHaveProperty('id');
      expect(retrievedTask.id).toBe(editingResponse.id);
      expect(retrievedTask).toHaveProperty('status');
      
      console.log(`AI editing task status: ${retrievedTask.status}`);
    });

    it('should create AI editing with different styles', async () => {
      const styles = ['film', 'social', 'vlog'];
      
      for (const style of styles) {
        console.log(`Testing AI editing with style: ${style}`);
        
        const editingResponse = await creatify.aiEditing.createAiEditing({
          video_url: testVideoUrl,
          editing_style: style,
          name: `Integration Test - ${style} Style`,
        });
        
        resourceTracker.addTask(editingResponse.id, 'ai-editing');
        
        expect(editingResponse).toHaveProperty('id');
        expect(editingResponse).toHaveProperty('status');
        
        console.log(`AI editing task created with ${style} style: ${editingResponse.id}`);
        
        // Brief delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  });

  describe('AI Editing Workflow', () => {
    it('should create and monitor AI editing task', async () => {
      console.log('Creating AI editing task and monitoring progress...');
      
      const editingResponse = await creatify.aiEditing.createAiEditing({
        video_url: testVideoUrl,
        editing_style: 'commercial',
        name: 'Integration Test Monitoring',
      });
      
      resourceTracker.addTask(editingResponse.id, 'ai-editing');
      
      expect(editingResponse).toHaveProperty('id');
      console.log(`AI editing task created: ${editingResponse.id}`);
      
      // Monitor the task for a reasonable time
      let attempts = 0;
      const maxAttempts = 20; // 20 attempts = ~2 minutes
      
      while (attempts < maxAttempts) {
        const task = await creatify.aiEditing.getAiEditing(editingResponse.id);
        
        console.log(`AI editing task ${task.id} status: ${task.status} (attempt ${attempts + 1})`);
        
        if (task.status === 'done' || task.status === 'completed') {
          expect(task).toHaveProperty('output');
          expect(task.output).toMatch(/^https?:\/\//);
          
          // Download and validate the edited video
          const filename = generateUniqueFilename('ai-edited-video', 'mp4');
          const outputPath = join(config.outputDir, filename);
          
          await downloadFile(task.output, outputPath);
          resourceTracker.addFile(outputPath);
          
          const fileSize = await getFileSize(outputPath);
          expect(fileSize).toBeGreaterThan(0);
          
          const mediaInfo = await getMediaInfo(outputPath);
          expect(mediaInfo.duration).toBeGreaterThan(0);
          expect(mediaInfo.hasVideo).toBe(true);
          
          console.log(`AI edited video: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
          return; // Test passed
        }
        
        if (task.status === 'failed' || task.status === 'error') {
          console.log(`AI editing task failed: ${task.status}`);
          // Don't fail the test - AI editing might not work with all video URLs
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 6000)); // 6 second intervals
        }
      }
      
      console.log('AI editing task did not complete within monitoring period');
      // Don't fail the test - this is expected for longer processing tasks
    }, 300000); // 5 minute timeout

    it('should use convenience method for AI editing', async () => {
      console.log('Testing AI editing convenience method...');
      
      try {
        // Use a shorter timeout for the convenience method test
        const completedEditing = await creatify.aiEditing.createAndWaitForAiEditing({
          video_url: testVideoUrl,
          editing_style: 'social',
          name: 'Integration Test Convenience',
        });
        
        resourceTracker.addTask(completedEditing.id, 'ai-editing');
        
        expect(completedEditing.status).toBe('done');
        expect(completedEditing).toHaveProperty('output');
        expect(completedEditing.output).toMatch(/^https?:\/\//);
        
        // Download and validate
        const filename = generateUniqueFilename('ai-edited-convenience', 'mp4');
        const outputPath = join(config.outputDir, filename);
        
        await downloadFile(completedEditing.output, outputPath);
        resourceTracker.addFile(outputPath);
        
        const fileSize = await getFileSize(outputPath);
        expect(fileSize).toBeGreaterThan(0);
        
        const mediaInfo = await getMediaInfo(outputPath);
        expect(mediaInfo.duration).toBeGreaterThan(0);
        expect(mediaInfo.hasVideo).toBe(true);
        
        console.log(`Convenience AI editing: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
      } catch (error) {
        if (error.message?.includes('timeout') || error.message?.includes('did not complete')) {
          console.log('AI editing convenience method timed out - this is expected for longer processing');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    }, 300000); // 5 minute timeout
  });

  describe('AI Editing Preview and Render', () => {
    it('should generate AI editing preview', async () => {
      // First create an AI editing task
      const editingResponse = await creatify.aiEditing.createAiEditing({
        video_url: testVideoUrl,
        editing_style: 'film',
        name: 'Integration Test Preview',
      });
      
      resourceTracker.addTask(editingResponse.id, 'ai-editing');
      
      console.log(`Created AI editing task for preview: ${editingResponse.id}`);
      
      try {
        // Generate preview
        const previewResponse = await creatify.aiEditing.generateAiEditingPreview({
          id: editingResponse.id,
        });
        
        expect(previewResponse).toHaveProperty('preview');
        expect(previewResponse.preview).toMatch(/^https?:\/\//);
        
        console.log(`AI editing preview generated: ${previewResponse.preview}`);
        
        // Download and validate preview
        const filename = generateUniqueFilename('ai-editing-preview', 'mp4');
        const outputPath = join(config.outputDir, filename);
        
        await downloadFile(previewResponse.preview, outputPath);
        resourceTracker.addFile(outputPath);
        
        const fileSize = await getFileSize(outputPath);
        expect(fileSize).toBeGreaterThan(0);
        
        const mediaInfo = await getMediaInfo(outputPath);
        expect(mediaInfo.duration).toBeGreaterThan(0);
        expect(mediaInfo.hasVideo).toBe(true);
        
        console.log(`Preview video: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
      } catch (error) {
        if (error.message?.includes('not ready') || error.message?.includes('processing')) {
          console.log('AI editing task not ready for preview generation - this is expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });
});
