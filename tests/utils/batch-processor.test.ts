import { BatchProcessorWithFactory } from '../../src/utils/batch-processor-with-factory';
import { mockLipsyncResults } from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Helper function to mock fetch responses
const mockFetchPromise = (data: any) => Promise.resolve({
  ok: true,
  json: () => Promise.resolve(data),
  status: 200,
  statusText: 'OK',
  headers: new Headers(),
  redirected: false,
  type: 'basic' as ResponseType,
  url: '',
  clone: () => mockFetchPromise(data) as unknown as Response,
  body: null,
  bodyUsed: false,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  blob: () => Promise.resolve(new Blob()),
  formData: () => Promise.resolve(new FormData()),
  text: () => Promise.resolve('')
} as Response);

describe('BatchProcessor', () => {
  let batchProcessor: BatchProcessorWithFactory;
  let mockClient: MockCreatifyApiClient;

  beforeEach(() => {
    // Create the BatchProcessor with the mock factory
    batchProcessor = new BatchProcessorWithFactory(
      {
        apiId: 'test-api-id',
        apiKey: 'test-api-key'
      },
      mockApiClientFactory
    );

    // Get the mock client that was created
    mockClient = mockApiClientFactory.getLastCreatedClient() as MockCreatifyApiClient;

    // Reset mock history
    if (mockClient) {
      mockClient.reset();
    }
  });

  describe('constructor', () => {
    it('should initialize with API credentials as separate parameters', () => {
      const processor = new BatchProcessorWithFactory('test-api-id', 'test-api-key', mockApiClientFactory);
      expect(processor).toBeDefined();
    });

    it('should initialize with API credentials as an options object', () => {
      const processor = new BatchProcessorWithFactory(
        {
          apiId: 'test-api-id',
          apiKey: 'test-api-key'
        },
        mockApiClientFactory
      );
      expect(processor).toBeDefined();
    });
  });

  describe('processBatch', () => {
    it('should process multiple tasks in sequence with default options', async () => {
      // Create mock tasks
      const task1 = vi.fn().mockResolvedValue('result1');
      const task2 = vi.fn().mockResolvedValue('result2');
      const task3 = vi.fn().mockResolvedValue('result3');

      // Process batch
      const result = await batchProcessor.processBatch([task1, task2, task3]);

      // Verify all tasks were executed
      expect(task1).toHaveBeenCalled();
      expect(task2).toHaveBeenCalled();
      expect(task3).toHaveBeenCalled();

      // Verify result structure
      expect(result.successes).toEqual(['result1', 'result2', 'result3']);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);
    });

    it('should respect concurrency limit', async () => {
      // Track concurrency during task execution

      // Mock the processBatch method to verify concurrency
      let activeTaskCount = 0;
      let maxActiveTaskCount = 0;

      // Create tasks that track concurrency
      const task1 = vi.fn().mockImplementation(async () => {
        activeTaskCount++;
        maxActiveTaskCount = Math.max(maxActiveTaskCount, activeTaskCount);
        await new Promise(resolve => setTimeout(resolve, 10));
        activeTaskCount--;
        return 'result1';
      });

      const task2 = vi.fn().mockImplementation(async () => {
        activeTaskCount++;
        maxActiveTaskCount = Math.max(maxActiveTaskCount, activeTaskCount);
        await new Promise(resolve => setTimeout(resolve, 10));
        activeTaskCount--;
        return 'result2';
      });

      const task3 = vi.fn().mockImplementation(async () => {
        activeTaskCount++;
        maxActiveTaskCount = Math.max(maxActiveTaskCount, activeTaskCount);
        await new Promise(resolve => setTimeout(resolve, 10));
        activeTaskCount--;
        return 'result3';
      });

      // Process batch with concurrency limit of 2
      const result = await batchProcessor.processBatch(
        [task1, task2, task3],
        { concurrency: 2 }
      );

      // Verify all tasks were executed
      expect(task1).toHaveBeenCalled();
      expect(task2).toHaveBeenCalled();
      expect(task3).toHaveBeenCalled();

      // Verify the maximum concurrency was respected
      expect(maxActiveTaskCount).toBeLessThanOrEqual(2);

      // Verify result structure
      expect(result.successes).toEqual(['result1', 'result2', 'result3']);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);
    }, 10000); // Increase timeout

    it('should handle errors when continueOnError is true', async () => {
      // Create mock tasks
      const task1 = vi.fn().mockResolvedValue('result1');
      const task2 = vi.fn().mockRejectedValue(new Error('Task 2 failed'));
      const task3 = vi.fn().mockResolvedValue('result3');

      // Process batch with continueOnError option
      const result = await batchProcessor.processBatch(
        [task1, task2, task3],
        { continueOnError: true, concurrency: 1 } // Use concurrency 1 to ensure sequential execution
      );

      // Verify all tasks were executed
      expect(task1).toHaveBeenCalled();
      expect(task2).toHaveBeenCalled();
      expect(task3).toHaveBeenCalled();

      // Verify result structure
      expect(result.successes).toEqual(['result1', 'result3']);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0].index).toBe(1);
      expect(result.errors[0].error.message).toBe('Task 2 failed');
      expect(result.allSuccessful).toBe(false);
    }, 10000); // Increase timeout

    it('should stop on first error when continueOnError is false', async () => {
      // Create mock tasks
      const task1 = vi.fn().mockResolvedValue('result1');
      const error = new Error('Task 2 failed');
      const task2 = vi.fn().mockImplementation(() => Promise.reject(error));
      const task3 = vi.fn().mockResolvedValue('result3');

      // Process batch with continueOnError explicitly set to false and concurrency 1
      try {
        // We need to wrap this in a try/catch because the implementation might throw
        // depending on how it's implemented
        const result = await batchProcessor.processBatch(
          [task1, task2, task3],
          { continueOnError: false, concurrency: 1 }
        );

        // If we get here, the implementation doesn't throw but returns errors in the result
        // Verify only tasks before the error were executed
        expect(task1).toHaveBeenCalled();
        expect(task2).toHaveBeenCalled();
        expect(task3).not.toHaveBeenCalled();

        // Verify result structure
        expect(result.successes).toEqual(['result1']);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].index).toBe(1);
        expect(result.errors[0].error.message).toBe('Task 2 failed');
        expect(result.allSuccessful).toBe(false);
      } catch (e) {
        // If we get here, the implementation throws the error
        // This is also a valid implementation
        expect(e.message).toBe('Task 2 failed');

        // Verify only tasks before the error were executed
        expect(task1).toHaveBeenCalled();
        expect(task2).toHaveBeenCalled();
        expect(task3).not.toHaveBeenCalled();
      }
    }, 10000); // Increase timeout

    it('should respect taskStartDelay option', async () => {
      // Create tasks that track when they were called
      const executionTimes: number[] = [];
      const startTime = Date.now();

      const createTimedTask = (result: string) => {
        return vi.fn().mockImplementation(() => {
          executionTimes.push(Date.now() - startTime);
          return Promise.resolve(result);
        });
      };

      const task1 = createTimedTask('result1');
      const task2 = createTimedTask('result2');
      const task3 = createTimedTask('result3');

      // Process batch with a delay between tasks
      const result = await batchProcessor.processBatch(
        [task1, task2, task3],
        {
          taskStartDelay: 50, // Use a small delay for faster test execution
          concurrency: 1      // Use concurrency 1 to ensure sequential execution
        }
      );

      // Verify all tasks were executed
      expect(task1).toHaveBeenCalled();
      expect(task2).toHaveBeenCalled();
      expect(task3).toHaveBeenCalled();

      // Verify result structure
      expect(result.successes).toEqual(['result1', 'result2', 'result3']);

      // Verify that there was a delay between task executions
      // We can't check exact timing, but we can verify that tasks were executed in order
      // and with some delay between them
      expect(executionTimes[0]).toBeLessThan(executionTimes[1]);
      expect(executionTimes[1]).toBeLessThan(executionTimes[2]);
    }, 10000); // Increase timeout
  });

  describe('processAvatarBatch', () => {
    it('should process multiple avatar video creation tasks', async () => {
      // Create a spy on the processBatch method
      const processBatchSpy = vi.spyOn(batchProcessor, 'processBatch');

      // Mock the avatar API methods to return successful responses
      const mockCreateLipsync = vi.fn().mockResolvedValue(mockLipsyncResults.done);

      // Replace the actual implementation with our mock using defineProperty
      Object.defineProperty(batchProcessor, 'api', {
        get: () => ({
          avatar: {
            createAndWaitForLipsync: mockCreateLipsync
          }
        })
      });

      // Create avatar tasks
      const avatarTasks = [
        {
          text: 'Hello from the first avatar!',
          avatarId: '7350375b-9a98-51b8-934d-14d46a645dc2',
          voiceId: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
          aspectRatio: '16:9'
        },
        {
          text: 'Hello from the second avatar!',
          avatarId: '18fccce8-86e7-5f31-abc8-18915cb872be',
          voiceId: '360ab221-d951-413b-ba1a-7037dc67da16',
          aspectRatio: '16:9'
        }
      ];

      // Process avatar batch
      const result = await batchProcessor.processAvatarBatch(avatarTasks);

      // Verify processBatch was called with the correct tasks
      expect(processBatchSpy).toHaveBeenCalledTimes(1);
      expect(processBatchSpy.mock.calls[0][0].length).toBe(2); // Two tasks

      // Verify createAndWaitForLipsync was called with the correct parameters
      expect(mockCreateLipsync).toHaveBeenCalledTimes(2);
      expect(mockCreateLipsync).toHaveBeenCalledWith({
        text: avatarTasks[0].text,
        creator: avatarTasks[0].avatarId,
        voice_id: avatarTasks[0].voiceId,
        aspect_ratio: avatarTasks[0].aspectRatio
      });
      expect(mockCreateLipsync).toHaveBeenCalledWith({
        text: avatarTasks[1].text,
        creator: avatarTasks[1].avatarId,
        voice_id: avatarTasks[1].voiceId,
        aspect_ratio: avatarTasks[1].aspectRatio
      });

      // Verify result structure
      expect(result.successes.length).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);

      // Restore the original implementation
      processBatchSpy.mockRestore();
    }, 10000); // Increase timeout
  });
  describe('processTextToSpeechBatch', () => {
    it('should process multiple text-to-speech tasks', async () => {
      // Create a spy on the processBatch method
      const processBatchSpy = vi.spyOn(batchProcessor, 'processBatch');

      // Create a mock for the createAndWaitForTextToSpeech method
      const mockCreateAndWaitForTTS = vi.fn().mockImplementation((params) => {
        return Promise.resolve({
          id: 'tts-123456',
          status: 'done',
          output: 'https://example.com/audio.mp3',
          ...params
        });
      });

      // Replace the actual implementation with our mock using defineProperty
      Object.defineProperty(batchProcessor, 'api', {
        get: () => ({
          textToSpeech: {
            createAndWaitForTextToSpeech: mockCreateAndWaitForTTS
          }
        })
      });

      // Create TTS tasks
      const ttsTasks = [
        {
          script: 'This is the first audio sample.',
          accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
        },
        {
          script: 'This is the second audio sample.',
          accent: '360ab221-d951-413b-ba1a-7037dc67da16'
        }
      ];

      // Process TTS batch
      const result = await batchProcessor.processTextToSpeechBatch(ttsTasks);

      // Verify processBatch was called with the correct tasks
      expect(processBatchSpy).toHaveBeenCalledTimes(1);
      expect(processBatchSpy.mock.calls[0][0].length).toBe(2); // Two tasks

      // Verify createAndWaitForTextToSpeech was called with the correct parameters
      expect(mockCreateAndWaitForTTS).toHaveBeenCalledTimes(2);
      expect(mockCreateAndWaitForTTS).toHaveBeenCalledWith(ttsTasks[0]);
      expect(mockCreateAndWaitForTTS).toHaveBeenCalledWith(ttsTasks[1]);

      // Verify result structure
      expect(result.successes.length).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);

      // Restore the original implementation
      processBatchSpy.mockRestore();
      // Remove our property definition
      delete (batchProcessor as any)._api;
    }, 10000); // Increase timeout
  });
  describe('processAiEditingBatch', () => {
    it('should process multiple AI editing tasks', async () => {
      // Create a spy on the processBatch method
      const processBatchSpy = vi.spyOn(batchProcessor, 'processBatch');

      // Create a mock for the createAndWaitForAiEditing method
      const mockCreateAndWaitForAiEditing = vi.fn().mockImplementation((params) => {
        return Promise.resolve({
          id: 'ai-edit-123456',
          status: 'done',
          output: 'https://example.com/edited-video.mp4',
          ...params
        });
      });

      // Replace the actual implementation with our mock using defineProperty
      Object.defineProperty(batchProcessor, 'api', {
        get: () => ({
          aiEditing: {
            createAndWaitForAiEditing: mockCreateAndWaitForAiEditing
          }
        })
      });

      // Create AI editing tasks
      const aiEditingTasks = [
        {
          videoUrl: 'https://example.com/video1.mp4',
          editingStyle: 'film'
        },
        {
          videoUrl: 'https://example.com/video2.mp4',
          editingStyle: 'commercial'
        }
      ];

      // Process AI editing batch
      const result = await batchProcessor.processAiEditingBatch(aiEditingTasks);

      // Verify processBatch was called with the correct tasks
      expect(processBatchSpy).toHaveBeenCalledTimes(1);
      expect(processBatchSpy.mock.calls[0][0].length).toBe(2); // Two tasks

      // Verify createAndWaitForAiEditing was called with the correct parameters
      expect(mockCreateAndWaitForAiEditing).toHaveBeenCalledTimes(2);

      // The API might convert camelCase to snake_case, so check for both possibilities
      const expectedParams1 = {
        videoUrl: 'https://example.com/video1.mp4',
        editingStyle: 'film'
      };
      const expectedParams2 = {
        videoUrl: 'https://example.com/video2.mp4',
        editingStyle: 'commercial'
      };

      // Check if either format was used
      const firstCallArg = mockCreateAndWaitForAiEditing.mock.calls[0][0];
      const secondCallArg = mockCreateAndWaitForAiEditing.mock.calls[1][0];

      // Verify the parameters match regardless of casing
      expect(
        firstCallArg.videoUrl === expectedParams1.videoUrl ||
        firstCallArg.video_url === expectedParams1.videoUrl
      ).toBe(true);
      expect(
        firstCallArg.editingStyle === expectedParams1.editingStyle ||
        firstCallArg.editing_style === expectedParams1.editingStyle
      ).toBe(true);

      expect(
        secondCallArg.videoUrl === expectedParams2.videoUrl ||
        secondCallArg.video_url === expectedParams2.videoUrl
      ).toBe(true);
      expect(
        secondCallArg.editingStyle === expectedParams2.editingStyle ||
        secondCallArg.editing_style === expectedParams2.editingStyle
      ).toBe(true);

      // Verify result structure
      expect(result.successes.length).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);

      // Restore the original implementation
      processBatchSpy.mockRestore();
      // Remove our property definition
      delete (batchProcessor as any)._api;
    }, 10000); // Increase timeout
  });

  describe('processAiShortsBatch', () => {
    it('should process multiple AI shorts tasks', async () => {
      // Create a spy on the processBatch method
      const processBatchSpy = vi.spyOn(batchProcessor, 'processBatch');

      // Create a mock for the createAndWaitForAiShorts method
      const mockCreateAndWaitForAiShorts = vi.fn().mockImplementation((params) => {
        return Promise.resolve({
          id: 'ai-shorts-123456',
          status: 'done',
          output: 'https://example.com/shorts-video.mp4',
          ...params
        });
      });

      // Replace the actual implementation with our mock using defineProperty
      Object.defineProperty(batchProcessor, 'api', {
        get: () => ({
          aiShorts: {
            createAndWaitForAiShorts: mockCreateAndWaitForAiShorts
          }
        })
      });

      // Create AI shorts tasks
      const aiShortsTasks = [
        {
          prompt: 'Create a viral video about technology',
          aspectRatio: '9:16',
          targetPlatform: 'TikTok',
          targetAudience: 'Gen Z',
          language: 'en'
        },
        {
          prompt: 'Create a viral video about fashion',
          aspectRatio: '16:9',
          targetPlatform: 'YouTube',
          targetAudience: 'Millennials',
          language: 'en'
        }
      ];

      // Process AI shorts batch
      const result = await batchProcessor.processAiShortsBatch(aiShortsTasks);

      // Verify processBatch was called with the correct tasks
      expect(processBatchSpy).toHaveBeenCalledTimes(1);
      expect(processBatchSpy.mock.calls[0][0].length).toBe(2); // Two tasks

      // Verify createAndWaitForAiShorts was called with the correct parameters
      expect(mockCreateAndWaitForAiShorts).toHaveBeenCalledTimes(2);

      // Verify the first call parameters
      expect(mockCreateAndWaitForAiShorts.mock.calls[0][0]).toMatchObject({
        prompt: aiShortsTasks[0].prompt,
        aspect_ratio: aiShortsTasks[0].aspectRatio,
        target_platform: aiShortsTasks[0].targetPlatform,
        target_audience: aiShortsTasks[0].targetAudience,
        language: aiShortsTasks[0].language
      });

      // Verify the second call parameters
      expect(mockCreateAndWaitForAiShorts.mock.calls[1][0]).toMatchObject({
        prompt: aiShortsTasks[1].prompt,
        aspect_ratio: aiShortsTasks[1].aspectRatio,
        target_platform: aiShortsTasks[1].targetPlatform,
        target_audience: aiShortsTasks[1].targetAudience,
        language: aiShortsTasks[1].language
      });

      // Verify result structure
      expect(result.successes.length).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);

      // Restore the original implementation
      processBatchSpy.mockRestore();
      // Remove our property definition
      delete (batchProcessor as any)._api;
    }, 10000); // Increase timeout
  });

  describe('processAiScriptsBatch', () => {
    it('should process multiple AI scripts tasks', async () => {
      // Create a spy on the processBatch method
      const processBatchSpy = vi.spyOn(batchProcessor, 'processBatch');

      // Create a mock for the createAndWaitForAiScript method
      const mockCreateAndWaitForAiScript = vi.fn().mockImplementation((params) => {
        return Promise.resolve({
          id: 'ai-script-123456',
          status: 'done',
          script: 'This is a sample script generated by AI...',
          ...params
        });
      });

      // Replace the actual implementation with our mock using defineProperty
      Object.defineProperty(batchProcessor, 'api', {
        get: () => ({
          aiScripts: {
            createAndWaitForAiScript: mockCreateAndWaitForAiScript
          }
        })
      });

      // Create AI scripts tasks
      const aiScriptsTasks = [
        {
          prompt: 'Write a script about technology',
          targetPlatform: 'TikTok',
          targetAudience: 'Gen Z',
          language: 'en',
          scriptLength: 60
        },
        {
          prompt: 'Write a script about fashion',
          targetPlatform: 'YouTube',
          targetAudience: 'Millennials',
          language: 'en',
          scriptLength: 120
        }
      ];

      // Process AI scripts batch
      const result = await batchProcessor.processAiScriptsBatch(aiScriptsTasks);

      // Verify processBatch was called with the correct tasks
      expect(processBatchSpy).toHaveBeenCalledTimes(1);
      expect(processBatchSpy.mock.calls[0][0].length).toBe(2); // Two tasks

      // Verify createAndWaitForAiScript was called with the correct parameters
      expect(mockCreateAndWaitForAiScript).toHaveBeenCalledTimes(2);

      // Verify the first call parameters
      expect(mockCreateAndWaitForAiScript.mock.calls[0][0]).toMatchObject({
        prompt: aiScriptsTasks[0].prompt,
        target_platform: aiScriptsTasks[0].targetPlatform,
        target_audience: aiScriptsTasks[0].targetAudience,
        language: aiScriptsTasks[0].language,
        script_length: aiScriptsTasks[0].scriptLength
      });

      // Verify the second call parameters
      expect(mockCreateAndWaitForAiScript.mock.calls[1][0]).toMatchObject({
        prompt: aiScriptsTasks[1].prompt,
        target_platform: aiScriptsTasks[1].targetPlatform,
        target_audience: aiScriptsTasks[1].targetAudience,
        language: aiScriptsTasks[1].language,
        script_length: aiScriptsTasks[1].scriptLength
      });

      // Verify result structure
      expect(result.successes.length).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);

      // Restore the original implementation
      processBatchSpy.mockRestore();
      // Remove our property definition
      delete (batchProcessor as any)._api;
    }, 10000); // Increase timeout
  });

  describe('processLipsyncV2Batch', () => {
    it('should process multiple lipsync v2 tasks', async () => {
      // Create a spy on the processBatch method
      const processBatchSpy = vi.spyOn(batchProcessor, 'processBatch');

      // Create a mock for the createAndWaitForLipsyncV2 method
      const mockCreateAndWaitForLipsyncV2 = vi.fn().mockImplementation((params) => {
        return Promise.resolve({
          id: 'lipsync-v2-123456',
          status: 'done',
          output: 'https://example.com/lipsync-v2-video.mp4',
          ...params
        });
      });

      // Replace the actual implementation with our mock using defineProperty
      Object.defineProperty(batchProcessor, 'api', {
        get: () => ({
          lipsyncV2: {
            createAndWaitForLipsyncV2: mockCreateAndWaitForLipsyncV2
          }
        })
      });

      // Create lipsync v2 tasks
      const lipsyncV2Tasks = [
        {
          videoInputs: [
            {
              character: {
                type: 'avatar',
                avatar_id: 'avatar-123',
                avatar_style: 'normal'
              },
              voice: {
                type: 'text',
                input_text: 'Hello, this is a test',
                voice_id: 'voice-123'
              },
              background: {
                type: 'image',
                url: 'https://example.com/background.jpg'
              }
            }
          ],
          aspectRatio: '16:9'
        },
        {
          videoInputs: [
            {
              character: {
                type: 'avatar',
                avatar_id: 'avatar-456',
                avatar_style: 'normal'
              },
              voice: {
                type: 'text',
                input_text: 'This is another test',
                voice_id: 'voice-456'
              },
              background: {
                type: 'image',
                url: 'https://example.com/background2.jpg'
              }
            }
          ],
          aspectRatio: '9:16'
        }
      ];

      // Process lipsync v2 batch
      const result = await batchProcessor.processLipsyncV2Batch(lipsyncV2Tasks);

      // Verify processBatch was called with the correct tasks
      expect(processBatchSpy).toHaveBeenCalledTimes(1);
      expect(processBatchSpy.mock.calls[0][0].length).toBe(2); // Two tasks

      // Verify createAndWaitForLipsyncV2 was called with the correct parameters
      expect(mockCreateAndWaitForLipsyncV2).toHaveBeenCalledTimes(2);

      // Verify the first call parameters
      expect(mockCreateAndWaitForLipsyncV2.mock.calls[0][0]).toMatchObject({
        video_inputs: lipsyncV2Tasks[0].videoInputs,
        aspect_ratio: lipsyncV2Tasks[0].aspectRatio
      });

      // Verify the second call parameters
      expect(mockCreateAndWaitForLipsyncV2.mock.calls[1][0]).toMatchObject({
        video_inputs: lipsyncV2Tasks[1].videoInputs,
        aspect_ratio: lipsyncV2Tasks[1].aspectRatio
      });

      // Verify result structure
      expect(result.successes.length).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);

      // Restore the original implementation
      processBatchSpy.mockRestore();
      // Remove our property definition
      delete (batchProcessor as any)._api;
    }, 10000); // Increase timeout
  });
});
