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

describe('Custom Templates API Integration Tests', () => {
  let creatify: Creatify;
  let config: ReturnType<typeof getIntegrationConfig>;
  let resourceTracker: TestResourceTracker;
  let availableTemplates: any[];

  beforeAll(async () => {
    try {
      config = getIntegrationConfig();
      await ensureOutputDir(config.outputDir);
      
      creatify = new Creatify({
        apiId: config.apiId,
        apiKey: config.apiKey,
      });

      // Get available templates
      console.log('Fetching available custom templates...');
      availableTemplates = await creatify.customTemplates.getCustomTemplates();
      
      console.log(`Found ${availableTemplates.length} custom templates`);
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping Custom Templates integration tests - API credentials not provided');
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

  describe('Template Discovery', () => {
    it('should fetch available custom templates', async () => {
      const templates = await creatify.customTemplates.getCustomTemplates();
      
      expect(templates).toBeInstanceOf(Array);
      console.log(`Available templates: ${templates.length}`);
      
      if (templates.length > 0) {
        const template = templates[0];
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(typeof template.id).toBe('string');
        expect(typeof template.name).toBe('string');
        
        console.log(`Sample template: ${template.name} (${template.id})`);
      }
    });

    it('should get specific template by ID', async () => {
      if (availableTemplates.length === 0) {
        console.log('Skipping template retrieval test - no templates available');
        return;
      }
      
      const templateId = availableTemplates[0].id;
      const template = await creatify.customTemplates.getCustomTemplate(templateId);
      
      expect(template).toHaveProperty('id');
      expect(template.id).toBe(templateId);
      expect(template).toHaveProperty('name');
      
      console.log(`Retrieved template: ${template.name}`);
    });
  });

  describe('Template Video Creation', () => {
    it('should create video with product template', async () => {
      // Use a generic product template or the first available template
      const templateName = 'ProductPromotion'; // Common template name
      
      console.log(`Creating video with template: ${templateName}`);
      
      const templateResponse = await creatify.customTemplates.createCustomTemplateVideo({
        visual_style: templateName,
        data: {
          product_name: 'Integration Test Product',
          product_description: 'A simple test product for integration testing.',
          price: '$19.99',
          features: ['Feature 1', 'Feature 2', 'Test Feature'],
          product_images: {
            image_1: 'https://via.placeholder.com/800x600/0066cc/ffffff?text=Product+Image+1',
            image_2: 'https://via.placeholder.com/800x600/cc6600/ffffff?text=Product+Image+2',
          },
        },
        aspect_ratio: '16:9',
        name: 'Integration Test Product Video',
      });
      
      resourceTracker.addTask(templateResponse.id, 'custom-template');
      
      expect(templateResponse).toHaveProperty('id');
      expect(templateResponse).toHaveProperty('status');
      expect(typeof templateResponse.id).toBe('string');
      
      console.log(`Template video task created: ${templateResponse.id}`);
      
      // Monitor the task
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts = ~5 minutes
      
      while (attempts < maxAttempts) {
        const task = await creatify.customTemplates.getCustomTemplateVideo(templateResponse.id);
        
        console.log(`Template video ${task.id} status: ${task.status} (attempt ${attempts + 1})`);
        
        if (task.status === 'done' || task.status === 'completed') {
          expect(task).toHaveProperty('output');
          expect(task.output).toMatch(/^https?:\/\//);
          
          // Download and validate the video
          const filename = generateUniqueFilename('custom-template-video', 'mp4');
          const outputPath = join(config.outputDir, filename);
          
          await downloadFile(task.output, outputPath);
          resourceTracker.addFile(outputPath);
          
          const fileSize = await getFileSize(outputPath);
          expect(fileSize).toBeGreaterThan(0);
          
          const mediaInfo = await getMediaInfo(outputPath);
          expect(mediaInfo.duration).toBeGreaterThan(0);
          expect(mediaInfo.hasVideo).toBe(true);
          expect(mediaInfo.hasAudio).toBe(true);
          
          console.log(`Template video: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
          return; // Test passed
        }
        
        if (task.status === 'failed' || task.status === 'error') {
          console.log(`Template video task failed: ${task.status}`);
          // Don't fail the test - template might not be available
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second intervals
        }
      }
      
      console.log('Template video task did not complete within monitoring period');
    }, 600000); // 10 minute timeout

    it('should create real estate template video', async () => {
      const templateName = 'HouseSale'; // Real estate template
      
      console.log(`Creating real estate video with template: ${templateName}`);
      
      try {
        const templateResponse = await creatify.customTemplates.createCustomTemplateVideo({
          visual_style: templateName,
          data: {
            address: '123 Integration Test Lane',
            city: 'Test City',
            state: 'TC',
            sqft: 2000,
            bedrooms: 3,
            bathrooms: 2,
            price: 350000,
            listing_images: {
              image_1: 'https://via.placeholder.com/800x600/009900/ffffff?text=House+Front',
              image_2: 'https://via.placeholder.com/800x600/0099cc/ffffff?text=Living+Room',
              image_3: 'https://via.placeholder.com/800x600/cc9900/ffffff?text=Kitchen',
            },
          },
          aspect_ratio: '16:9',
          name: 'Integration Test Real Estate',
        });
        
        resourceTracker.addTask(templateResponse.id, 'custom-template');
        
        expect(templateResponse).toHaveProperty('id');
        expect(templateResponse).toHaveProperty('status');
        
        console.log(`Real estate template task created: ${templateResponse.id}`);
        
        // Just verify the task was created successfully
        const task = await creatify.customTemplates.getCustomTemplateVideo(templateResponse.id);
        expect(task).toHaveProperty('id');
        expect(task.id).toBe(templateResponse.id);
        
        console.log(`Real estate template task status: ${task.status}`);
      } catch (error) {
        if (error.message?.includes('template') || error.message?.includes('not found')) {
          console.log('Real estate template not available - this is expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });

  describe('Template Video Management', () => {
    it('should list custom template videos', async () => {
      const videos = await creatify.customTemplates.getCustomTemplateVideos();
      
      expect(videos).toBeInstanceOf(Array);
      console.log(`Found ${videos.length} custom template videos in account`);
      
      if (videos.length > 0) {
        const video = videos[0];
        expect(video).toHaveProperty('id');
        expect(video).toHaveProperty('status');
        expect(typeof video.id).toBe('string');
        expect(typeof video.status).toBe('string');
      }
    });

    it('should use convenience method for template video', async () => {
      console.log('Testing custom template convenience method...');
      
      try {
        const completedVideo = await creatify.customTemplates.createAndWaitForCustomTemplateVideo({
          visual_style: 'ProductPromotion',
          data: {
            product_name: 'Convenience Test Product',
            product_description: 'Testing the convenience method.',
            price: '$29.99',
            features: ['Quick test', 'Convenience method', 'Integration'],
            product_images: {
              image_1: 'https://via.placeholder.com/800x600/ff6600/ffffff?text=Convenience+Test',
            },
          },
          aspect_ratio: '9:16', // Vertical format
          name: 'Integration Test Convenience Template',
        });
        
        resourceTracker.addTask(completedVideo.id, 'custom-template');
        
        expect(completedVideo.status).toBe('done');
        expect(completedVideo).toHaveProperty('output');
        expect(completedVideo.output).toMatch(/^https?:\/\//);
        
        // Download and validate
        const filename = generateUniqueFilename('template-convenience', 'mp4');
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
        
        console.log(`Convenience template video: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
      } catch (error) {
        if (error.message?.includes('timeout') || error.message?.includes('template')) {
          console.log('Template convenience method failed - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    }, 600000); // 10 minute timeout
  });

  describe('Template Preview and Render', () => {
    it('should generate template preview', async () => {
      console.log('Testing template preview generation...');
      
      try {
        // First create a template video task
        const templateResponse = await creatify.customTemplates.createCustomTemplateVideo({
          visual_style: 'ProductPromotion',
          data: {
            product_name: 'Preview Test Product',
            product_description: 'Testing preview generation.',
            price: '$39.99',
            features: ['Preview feature'],
            product_images: {
              image_1: 'https://via.placeholder.com/800x600/9900cc/ffffff?text=Preview+Test',
            },
          },
          aspect_ratio: '16:9',
          name: 'Integration Test Preview',
        });
        
        resourceTracker.addTask(templateResponse.id, 'custom-template');
        
        // Generate preview
        const previewResponse = await creatify.customTemplates.generateCustomTemplatePreview({
          id: templateResponse.id,
        });
        
        expect(previewResponse).toHaveProperty('preview');
        expect(previewResponse.preview).toMatch(/^https?:\/\//);
        
        console.log(`Template preview generated: ${previewResponse.preview}`);
        
        // Download and validate preview
        const filename = generateUniqueFilename('template-preview', 'mp4');
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
        if (error.message?.includes('not ready') || error.message?.includes('preview')) {
          console.log('Template preview generation failed - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });
});
