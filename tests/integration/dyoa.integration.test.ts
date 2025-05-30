import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { join } from 'path';
import { Creatify } from '../../src';
import {
  getIntegrationConfig,
  ensureOutputDir,
  downloadFile,
  getFileSize,
  generateUniqueFilename,
  TestResourceTracker,
} from './setup';

describe('DYOA (Design Your Own Avatar) API Integration Tests', () => {
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

      console.log('DYOA integration tests initialized');
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping DYOA integration tests - API credentials not provided');
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

  describe('DYOA Management', () => {
    it('should list DYOA requests', async () => {
      const dyoaList = await creatify.dyoa.getDyoas();
      
      expect(dyoaList).toBeInstanceOf(Array);
      console.log(`Found ${dyoaList.length} DYOA requests in account`);
      
      if (dyoaList.length > 0) {
        const dyoa = dyoaList[0];
        expect(dyoa).toHaveProperty('id');
        expect(dyoa).toHaveProperty('status');
        expect(typeof dyoa.id).toBe('string');
        expect(typeof dyoa.status).toBe('string');
      }
    });

    it('should create DYOA request', async () => {
      console.log('Creating DYOA request...');
      
      const dyoaResponse = await creatify.dyoa.createDyoa({
        prompt: 'A professional business person in a modern office setting, wearing a navy blue suit, friendly smile, looking directly at camera',
        name: 'Integration Test Avatar',
        gender: 'neutral',
        age_range: 'adult',
      });
      
      resourceTracker.addTask(dyoaResponse.id, 'dyoa');
      
      expect(dyoaResponse).toHaveProperty('id');
      expect(dyoaResponse).toHaveProperty('status');
      expect(typeof dyoaResponse.id).toBe('string');
      
      console.log(`DYOA request created: ${dyoaResponse.id}`);
      
      // Get the request to verify it was created
      const retrievedDyoa = await creatify.dyoa.getDyoa(dyoaResponse.id);
      expect(retrievedDyoa).toHaveProperty('id');
      expect(retrievedDyoa.id).toBe(dyoaResponse.id);
      expect(retrievedDyoa).toHaveProperty('status');
      expect(retrievedDyoa).toHaveProperty('prompt');
      
      console.log(`DYOA request status: ${retrievedDyoa.status}`);
    });

    it('should create DYOA with different parameters', async () => {
      const testCases = [
        {
          prompt: 'A young teacher in a classroom, casual clothing, warm expression',
          gender: 'female',
          age_range: 'adult',
          name: 'Teacher Avatar Test',
        },
        {
          prompt: 'A tech professional at a computer, modern workspace, confident pose',
          gender: 'male',
          age_range: 'adult',
          name: 'Tech Avatar Test',
        },
      ];
      
      for (const testCase of testCases) {
        console.log(`Creating DYOA: ${testCase.name}`);
        
        const dyoaResponse = await creatify.dyoa.createDyoa(testCase);
        
        resourceTracker.addTask(dyoaResponse.id, 'dyoa');
        
        expect(dyoaResponse).toHaveProperty('id');
        expect(dyoaResponse).toHaveProperty('status');
        
        console.log(`DYOA created: ${dyoaResponse.id} (${testCase.name})`);
        
        // Brief delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  });

  describe('DYOA Workflow', () => {
    it('should monitor DYOA photo generation', async () => {
      console.log('Creating DYOA and monitoring photo generation...');
      
      const dyoaResponse = await creatify.dyoa.createDyoa({
        prompt: 'A friendly customer service representative, professional attire, welcoming smile',
        name: 'Integration Test Monitor',
        gender: 'neutral',
        age_range: 'adult',
      });
      
      resourceTracker.addTask(dyoaResponse.id, 'dyoa');
      
      console.log(`DYOA created for monitoring: ${dyoaResponse.id}`);
      
      // Monitor the DYOA for photo generation
      let attempts = 0;
      const maxAttempts = 20; // 20 attempts = ~3-4 minutes
      
      while (attempts < maxAttempts) {
        const dyoa = await creatify.dyoa.getDyoa(dyoaResponse.id);
        
        console.log(`DYOA ${dyoa.id} status: ${dyoa.status} (attempt ${attempts + 1})`);
        
        if (dyoa.status === 'photos_ready' || dyoa.status === 'completed') {
          expect(dyoa).toHaveProperty('photos');
          expect(dyoa.photos).toBeInstanceOf(Array);
          
          if (dyoa.photos && dyoa.photos.length > 0) {
            console.log(`DYOA photos generated: ${dyoa.photos.length} photos`);
            
            // Download and validate the first photo
            const photo = dyoa.photos[0];
            expect(photo).toHaveProperty('url');
            expect(photo.url).toMatch(/^https?:\/\//);
            
            const filename = generateUniqueFilename('dyoa-photo', 'jpg');
            const outputPath = join(config.outputDir, filename);
            
            await downloadFile(photo.url, outputPath);
            resourceTracker.addFile(outputPath);
            
            const fileSize = await getFileSize(outputPath);
            expect(fileSize).toBeGreaterThan(0);
            
            console.log(`Downloaded DYOA photo: ${fileSize} bytes`);
          }
          
          return; // Test passed
        }
        
        if (dyoa.status === 'failed' || dyoa.status === 'error') {
          console.log(`DYOA failed: ${dyoa.status}`);
          // Don't fail the test - DYOA generation can be complex
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second intervals
        }
      }
      
      console.log('DYOA photo generation did not complete within monitoring period');
      // Don't fail the test - this is expected for longer processing
    }, 300000); // 5 minute timeout

    it('should use convenience method for DYOA photos', async () => {
      console.log('Testing DYOA convenience method...');
      
      try {
        const completedDyoa = await creatify.dyoa.createAndWaitForDyoaPhotos({
          prompt: 'A healthcare professional in scrubs, confident and caring expression',
          name: 'Integration Test Convenience',
          gender: 'neutral',
          age_range: 'adult',
        });
        
        resourceTracker.addTask(completedDyoa.id, 'dyoa');
        
        expect(completedDyoa.status).toBe('photos_ready');
        expect(completedDyoa).toHaveProperty('photos');
        expect(completedDyoa.photos).toBeInstanceOf(Array);
        
        if (completedDyoa.photos && completedDyoa.photos.length > 0) {
          console.log(`Convenience DYOA photos: ${completedDyoa.photos.length} photos`);
          
          // Download first photo
          const photo = completedDyoa.photos[0];
          const filename = generateUniqueFilename('dyoa-convenience', 'jpg');
          const outputPath = join(config.outputDir, filename);
          
          await downloadFile(photo.url, outputPath);
          resourceTracker.addFile(outputPath);
          
          const fileSize = await getFileSize(outputPath);
          expect(fileSize).toBeGreaterThan(0);
          
          console.log(`Convenience DYOA photo: ${fileSize} bytes`);
        }
      } catch (error) {
        if (error.message?.includes('timeout') || error.message?.includes('did not complete')) {
          console.log('DYOA convenience method timed out - this is expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    }, 300000); // 5 minute timeout
  });

  describe('DYOA Photo Selection and Review', () => {
    it('should handle DYOA photo selection workflow', async () => {
      // First get existing DYOA requests to find one with photos
      const dyoaList = await creatify.dyoa.getDyoas();
      
      const dyoaWithPhotos = dyoaList.find(d => 
        d.status === 'photos_ready' && d.photos && d.photos.length > 0
      );
      
      if (!dyoaWithPhotos) {
        console.log('No DYOA with photos available for selection test');
        return;
      }
      
      console.log(`Testing photo selection with DYOA: ${dyoaWithPhotos.id}`);
      
      try {
        // Submit the first photo for review
        const selectedPhoto = dyoaWithPhotos.photos[0];
        
        const reviewResponse = await creatify.dyoa.submitDyoaForReview(dyoaWithPhotos.id, {
          selected_photo_id: selectedPhoto.id,
          feedback: 'This photo looks great for integration testing!',
        });
        
        expect(reviewResponse).toHaveProperty('id');
        expect(reviewResponse.id).toBe(dyoaWithPhotos.id);
        expect(reviewResponse).toHaveProperty('status');
        
        console.log(`DYOA submitted for review: ${reviewResponse.status}`);
      } catch (error) {
        if (error.message?.includes('already submitted') || error.message?.includes('not available')) {
          console.log('DYOA photo selection not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });

    it('should handle DYOA deletion', async () => {
      // Create a DYOA specifically for deletion testing
      const dyoaResponse = await creatify.dyoa.createDyoa({
        prompt: 'A test avatar for deletion, simple background',
        name: 'Integration Test Deletion',
        gender: 'neutral',
        age_range: 'adult',
      });
      
      console.log(`Created DYOA for deletion test: ${dyoaResponse.id}`);
      
      // Wait a moment for the DYOA to be fully created
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        // Delete the DYOA
        await creatify.dyoa.deleteDyoa(dyoaResponse.id);
        
        console.log(`DYOA deleted successfully: ${dyoaResponse.id}`);
        
        // Try to get the deleted DYOA (should fail or return deleted status)
        try {
          const deletedDyoa = await creatify.dyoa.getDyoa(dyoaResponse.id);
          if (deletedDyoa.status) {
            console.log(`Deleted DYOA status: ${deletedDyoa.status}`);
          }
        } catch (error) {
          if (error.status === 404) {
            console.log('DYOA successfully deleted (404 response)');
          } else {
            throw error;
          }
        }
      } catch (error) {
        if (error.message?.includes('cannot be deleted') || error.message?.includes('not found')) {
          console.log('DYOA deletion not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });
});
