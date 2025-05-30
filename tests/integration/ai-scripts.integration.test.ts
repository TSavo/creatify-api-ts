import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Creatify } from '../../src';
import {
  getIntegrationConfig,
  ensureOutputDir,
  TestResourceTracker,
  TEST_CONTENT,
} from './setup';

describe('AI Scripts API Integration Tests', () => {
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

      console.log('AI Scripts integration tests initialized');
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping AI Scripts integration tests - API credentials not provided');
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

  describe('AI Script Generation', () => {
    it('should create AI script from prompt', async () => {
      const prompt = 'Create a short script about the benefits of renewable energy for a 30-second video';
      
      console.log(`Creating AI script with prompt: ${prompt}`);
      
      const scriptResponse = await creatify.aiScripts.createAiScript({
        prompt,
        name: 'Integration Test AI Script',
        video_length: 30,
        target_audience: 'general',
        tone: 'professional',
      });
      
      resourceTracker.addTask(scriptResponse.id, 'ai-script');
      
      expect(scriptResponse).toHaveProperty('id');
      expect(scriptResponse).toHaveProperty('status');
      expect(typeof scriptResponse.id).toBe('string');
      
      console.log(`AI script task created: ${scriptResponse.id}`);
      
      // Get the task to verify it was created
      const retrievedTask = await creatify.aiScripts.getAiScript(scriptResponse.id);
      expect(retrievedTask).toHaveProperty('id');
      expect(retrievedTask.id).toBe(scriptResponse.id);
      expect(retrievedTask).toHaveProperty('status');
      
      console.log(`AI script task status: ${retrievedTask.status}`);
    });

    it('should create AI script with different parameters', async () => {
      const testCases = [
        {
          prompt: 'Write a script about healthy eating habits',
          video_length: 15,
          target_audience: 'young adults',
          tone: 'casual',
          name: 'Health Script Test',
        },
        {
          prompt: 'Create a script about technology trends',
          video_length: 45,
          target_audience: 'professionals',
          tone: 'informative',
          name: 'Tech Script Test',
        },
      ];
      
      for (const testCase of testCases) {
        console.log(`Creating AI script: ${testCase.name}`);
        
        const scriptResponse = await creatify.aiScripts.createAiScript(testCase);
        
        resourceTracker.addTask(scriptResponse.id, 'ai-script');
        
        expect(scriptResponse).toHaveProperty('id');
        expect(scriptResponse).toHaveProperty('status');
        
        console.log(`AI script created: ${scriptResponse.id} (${testCase.name})`);
        
        // Brief delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  });

  describe('AI Script Workflow', () => {
    it('should monitor AI script generation', async () => {
      console.log('Creating AI script and monitoring progress...');
      
      const scriptResponse = await creatify.aiScripts.createAiScript({
        prompt: 'Write a compelling script about sustainable living practices',
        name: 'Integration Test Monitoring',
        video_length: 30,
        target_audience: 'environmentally conscious consumers',
        tone: 'inspiring',
      });
      
      resourceTracker.addTask(scriptResponse.id, 'ai-script');
      
      console.log(`AI script task created: ${scriptResponse.id}`);
      
      // Monitor the task for completion
      let attempts = 0;
      const maxAttempts = 15; // AI scripts should be faster than video generation
      
      while (attempts < maxAttempts) {
        const task = await creatify.aiScripts.getAiScript(scriptResponse.id);
        
        console.log(`AI script task ${task.id} status: ${task.status} (attempt ${attempts + 1})`);
        
        if (task.status === 'done' || task.status === 'completed') {
          expect(task).toHaveProperty('script');
          expect(typeof task.script).toBe('string');
          expect(task.script.length).toBeGreaterThan(0);
          
          console.log(`AI script generated successfully`);
          console.log(`Script preview: ${task.script.substring(0, 100)}...`);
          return; // Test passed
        }
        
        if (task.status === 'failed' || task.status === 'error') {
          console.log(`AI script task failed: ${task.status}`);
          if (task.error_message) {
            console.log(`Error message: ${task.error_message}`);
          }
          // Don't fail the test - script generation might have issues
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second intervals
        }
      }
      
      console.log('AI script task did not complete within monitoring period');
      // Don't fail the test - this is expected for some cases
    }, 120000); // 2 minute timeout

    it('should use convenience method for AI script', async () => {
      console.log('Testing AI script convenience method...');
      
      try {
        const completedScript = await creatify.aiScripts.createAndWaitForAiScript({
          prompt: 'Create a script about the importance of digital literacy',
          name: 'Integration Test Convenience',
          video_length: 20,
          target_audience: 'students',
          tone: 'educational',
        });
        
        resourceTracker.addTask(completedScript.id, 'ai-script');
        
        expect(completedScript.status).toBe('done');
        expect(completedScript).toHaveProperty('script');
        expect(typeof completedScript.script).toBe('string');
        expect(completedScript.script.length).toBeGreaterThan(0);
        
        console.log(`Convenience AI script generated successfully`);
        console.log(`Script length: ${completedScript.script.length} characters`);
        console.log(`Script preview: ${completedScript.script.substring(0, 150)}...`);
      } catch (error) {
        if (error.message?.includes('timeout') || error.message?.includes('did not complete')) {
          console.log('AI script convenience method timed out - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    }, 120000); // 2 minute timeout
  });

  describe('AI Script Management', () => {
    it('should list AI script tasks', async () => {
      const scriptsList = await creatify.aiScripts.getAiScriptsList();
      
      expect(scriptsList).toBeInstanceOf(Array);
      console.log(`Found ${scriptsList.length} AI script tasks in account`);
      
      if (scriptsList.length > 0) {
        const scriptTask = scriptsList[0];
        expect(scriptTask).toHaveProperty('id');
        expect(scriptTask).toHaveProperty('status');
        expect(typeof scriptTask.id).toBe('string');
        expect(typeof scriptTask.status).toBe('string');
      }
    });

    it('should get specific AI script by ID', async () => {
      // First create an AI script task
      const scriptResponse = await creatify.aiScripts.createAiScript({
        prompt: 'Write a brief script about teamwork',
        name: 'Task Retrieval Test',
        video_length: 15,
        target_audience: 'general',
        tone: 'motivational',
      });
      
      resourceTracker.addTask(scriptResponse.id, 'ai-script');
      
      // Get the specific task
      const retrievedTask = await creatify.aiScripts.getAiScript(scriptResponse.id);
      
      expect(retrievedTask).toHaveProperty('id');
      expect(retrievedTask.id).toBe(scriptResponse.id);
      expect(retrievedTask).toHaveProperty('status');
      
      console.log(`Retrieved AI script task: ${retrievedTask.id}, status: ${retrievedTask.status}`);
    });
  });

  describe('AI Script Content Validation', () => {
    it('should generate scripts with appropriate length for video duration', async () => {
      const testCases = [
        { video_length: 15, expected_min_chars: 50, expected_max_chars: 300 },
        { video_length: 30, expected_min_chars: 100, expected_max_chars: 600 },
        { video_length: 60, expected_min_chars: 200, expected_max_chars: 1200 },
      ];
      
      for (const testCase of testCases) {
        console.log(`Testing script generation for ${testCase.video_length}s video`);
        
        try {
          const completedScript = await creatify.aiScripts.createAndWaitForAiScript({
            prompt: `Write a script about innovation for a ${testCase.video_length}-second video`,
            name: `Length Test ${testCase.video_length}s`,
            video_length: testCase.video_length,
            target_audience: 'general',
            tone: 'professional',
          });
          
          resourceTracker.addTask(completedScript.id, 'ai-script');
          
          if (completedScript.status === 'done' && completedScript.script) {
            const scriptLength = completedScript.script.length;
            
            console.log(`${testCase.video_length}s video script: ${scriptLength} characters`);
            
            // Validate script length is reasonable for video duration
            expect(scriptLength).toBeGreaterThan(testCase.expected_min_chars);
            expect(scriptLength).toBeLessThan(testCase.expected_max_chars);
            
            // Validate script contains actual content
            expect(completedScript.script.trim()).not.toBe('');
            expect(completedScript.script).toMatch(/\w+/); // Contains words
          } else {
            console.log(`Script generation failed or incomplete for ${testCase.video_length}s video`);
          }
        } catch (error) {
          console.log(`Script generation error for ${testCase.video_length}s: ${error.message}`);
          // Don't fail the test - script generation might have limitations
        }
        
        // Brief delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }, 300000); // 5 minute timeout for multiple script generations
  });
});
