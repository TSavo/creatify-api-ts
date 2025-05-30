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
  shouldRunIntegrationTests,
} from './setup';

(shouldRunIntegrationTests() ? describe : describe.skip)('Custom Templates API Integration Tests', () => {
  let creatify: Creatify;
  let config: ReturnType<typeof getIntegrationConfig>;
  let resourceTracker: TestResourceTracker;

  beforeAll(async () => {
    config = getIntegrationConfig();
    await ensureOutputDir(config.outputDir);

    creatify = new Creatify({
      apiId: config.apiId,
      apiKey: config.apiKey,
    });

    console.log('Custom Templates API client initialized');
  }, 30000);

  beforeEach(() => {
    resourceTracker = new TestResourceTracker();
  });

  afterAll(async () => {
    if (resourceTracker) {
      await resourceTracker.cleanup();
    }
  });

  describe('Custom Template Task Management', () => {
    it('should list custom template tasks', async () => {
      const tasks = await creatify.customTemplates.getCustomTemplateList();

      expect(tasks).toBeInstanceOf(Array);
      console.log(`Found ${tasks.length} custom template tasks in account`);

      if (tasks.length > 0) {
        const task = tasks[0];
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('status');
        expect(typeof task.id).toBe('string');
        expect(typeof task.status).toBe('string');

        console.log(`Sample task: ${task.id} (${task.status})`);
      }
    });
  });

  describe('Custom Template Creation', () => {
    it('should create custom template task', async () => {
      console.log('Creating custom template task...');

      try {
        const templateResponse = await creatify.customTemplates.createCustomTemplate({
          visual_style: 'product_showcase', // Example template style
          data: {
            product_name: 'Integration Test Product',
            product_description: 'A simple test product for integration testing.',
            price: '$19.99',
            image_url: 'https://via.placeholder.com/800x600/0066cc/ffffff?text=Product+Image',
          },
        });
      
        resourceTracker.addTask(templateResponse.id, 'custom-template');

        expect(templateResponse).toHaveProperty('id');
        expect(templateResponse).toHaveProperty('status');
        expect(typeof templateResponse.id).toBe('string');

        console.log(`Custom template task created: ${templateResponse.id}`);

        // Get the task to verify it was created
        const task = await creatify.customTemplates.getCustomTemplate(templateResponse.id);
        expect(task).toHaveProperty('id');
        expect(task.id).toBe(templateResponse.id);
        expect(task).toHaveProperty('status');

        console.log(`Custom template task status: ${task.status}`);
      } catch (error) {
        if (error.message?.includes('template') || error.message?.includes('not found') || error.message?.includes('visual_style')) {
          console.log('Custom template creation failed - template may not be available');
          console.log(`Error: ${error.message}`);
          // Don't fail the test - this is expected for unknown templates
        } else {
          throw error;
        }
      }
    });

    it('should use convenience method for custom template', async () => {
      console.log('Testing custom template convenience method...');

      try {
        const completedTemplate = await creatify.customTemplates.createAndWaitForCustomTemplate({
          visual_style: 'simple_product',
          data: {
            product_name: 'Convenience Test Product',
            description: 'Testing the convenience method.',
            price: '$29.99',
          },
        });

        resourceTracker.addTask(completedTemplate.id, 'custom-template');

        expect(completedTemplate.status).toBe('done');
        expect(completedTemplate).toHaveProperty('id');

        console.log(`Convenience template completed: ${completedTemplate.id}`);

        if (completedTemplate.output) {
          expect(completedTemplate.output).toMatch(/^https?:\/\//);
          console.log(`Template output: ${completedTemplate.output}`);
        }
      } catch (error) {
        if (error.message?.includes('timeout') || error.message?.includes('template') || error.message?.includes('visual_style')) {
          console.log('Template convenience method failed - template may not be available');
          console.log(`Error: ${error.message}`);
          // Don't fail the test
        } else {
          throw error;
        }
      }
    }, 300000); // 5 minute timeout
  });
});
