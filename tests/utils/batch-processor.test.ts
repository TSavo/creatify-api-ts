import { BatchProcessor } from '../../src/utils/batch-processor';
import { 
  mockLipsyncCreationResponse, 
  mockLipsyncResults,
  mockTextToSpeechCreationResponse,
  mockTextToSpeechResults,
  mockAiEditingCreationResponse,
  mockAiEditingResults
} from '../mocks/api-responses';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch for testing
global.fetch = vi.fn();

// Create a mock Response
const mockJsonPromise = (data: any) => Promise.resolve(data);
const mockFetchPromise = (data: any, status = 200) => 
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => mockJsonPromise(data)
  } as Response);

describe('BatchProcessor', () => {
  let batchProcessor: BatchProcessor;
  
  beforeEach(() => {
    batchProcessor = new BatchProcessor('test-api-id', 'test-api-key');
    
    // Clear mock history
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  });
  
  describe('constructor', () => {
    it('should initialize with API credentials as separate parameters', () => {
      const processor = new BatchProcessor('test-api-id', 'test-api-key');
      expect(processor).toBeDefined();
    });
    
    it('should initialize with API credentials as an options object', () => {
      const processor = new BatchProcessor({
        apiId: 'test-api-id',
        apiKey: 'test-api-key'
      });
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
      // Create mock tasks with delays
      const createDelayedTask = (name: string, delay: number) => {
        return vi.fn().mockImplementation(() => {
          return new Promise(resolve => setTimeout(() => resolve(name), delay));
        });
      };
      
      const task1 = createDelayedTask('result1', 50);
      const task2 = createDelayedTask('result2', 100);
      const task3 = createDelayedTask('result3', 30);
      const task4 = createDelayedTask('result4', 80);
      const task5 = createDelayedTask('result5', 20);
      
      // Process batch with concurrency limit of 2
      const resultPromise = batchProcessor.processBatch(
        [task1, task2, task3, task4, task5],
        { concurrency: 2 }
      );
      
      // Fast-forward time a bit to start some tasks
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Verify only 2 tasks started initially (due to concurrency limit)
      expect(task1).toHaveBeenCalled();
      expect(task2).toHaveBeenCalled();
      expect(task3).not.toHaveBeenCalled();
      
      // Await the final result
      const result = await resultPromise;
      
      // After completion, all tasks should have been executed
      expect(task1).toHaveBeenCalled();
      expect(task2).toHaveBeenCalled();
      expect(task3).toHaveBeenCalled();
      expect(task4).toHaveBeenCalled();
      expect(task5).toHaveBeenCalled();
      
      // Verify result structure
      expect(result.successes.length).toBe(5);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);
    });
    
    it('should handle errors when continueOnError is true', async () => {
      // Create mock tasks
      const task1 = vi.fn().mockResolvedValue('result1');
      const task2 = vi.fn().mockRejectedValue(new Error('Task 2 failed'));
      const task3 = vi.fn().mockResolvedValue('result3');
      
      // Process batch with continueOnError option
      const result = await batchProcessor.processBatch(
        [task1, task2, task3],
        { continueOnError: true }
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
    });
    
    it('should stop on first error when continueOnError is false', async () => {
      // Create mock tasks
      const task1 = vi.fn().mockResolvedValue('result1');
      const task2 = vi.fn().mockRejectedValue(new Error('Task 2 failed'));
      const task3 = vi.fn().mockResolvedValue('result3');
      
      // Process batch with default options (continueOnError = false)
      await expect(batchProcessor.processBatch([task1, task2, task3]))
        .rejects.toThrow('Task 2 failed');
      
      // Verify only tasks before the error were executed
      expect(task1).toHaveBeenCalled();
      expect(task2).toHaveBeenCalled();
      expect(task3).not.toHaveBeenCalled();
    });
    
    it('should respect taskStartDelay option', async () => {
      // Mock setTimeout
      vi.useFakeTimers();
      
      // Create mock tasks
      const task1 = vi.fn().mockResolvedValue('result1');
      const task2 = vi.fn().mockResolvedValue('result2');
      const task3 = vi.fn().mockResolvedValue('result3');
      
      // Start the batch process with a 1000ms delay between tasks
      const resultPromise = batchProcessor.processBatch(
        [task1, task2, task3],
        { taskStartDelay: 1000 }
      );
      
      // First task should start immediately
      expect(task1).toHaveBeenCalled();
      expect(task2).not.toHaveBeenCalled();
      expect(task3).not.toHaveBeenCalled();
      
      // Advance timers to trigger second task
      vi.advanceTimersByTime(1000);
      
      // Second task should now have started
      expect(task2).toHaveBeenCalled();
      expect(task3).not.toHaveBeenCalled();
      
      // Advance timers to trigger third task
      vi.advanceTimersByTime(1000);
      
      // Third task should now have started
      expect(task3).toHaveBeenCalled();
      
      // Complete the promise to avoid unhandled promise rejection
      await resultPromise;
      
      // Restore timers
      vi.useRealTimers();
    });
  });
  
  describe('processAvatarBatch', () => {
    it('should process multiple avatar video creation tasks', async () => {
      // Mock API calls for two avatar tasks
      (global.fetch as ReturnType<typeof vi.fn>)
        // First task - create
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncCreationResponse))
        // First task - check status
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncResults.done))
        // Second task - create
        .mockImplementationOnce(() => mockFetchPromise({
          ...mockLipsyncCreationResponse,
          id: 'lipsync-654321'
        }))
        // Second task - check status
        .mockImplementationOnce(() => mockFetchPromise({
          ...mockLipsyncResults.done,
          id: 'lipsync-654321'
        }));
      
      // Mock timers
      vi.useFakeTimers();
      
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
      const resultPromise = batchProcessor.processAvatarBatch(avatarTasks);
      
      // Fast forward time to complete all tasks
      vi.advanceTimersByTime(5000);
      
      // Get the final result
      const result = await resultPromise;
      
      // Verify result structure
      expect(result.successes.length).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);
      
      // Restore timers
      vi.useRealTimers();
    });
  });
    describe('processTextToSpeechBatch', () => {
    it('should process multiple text-to-speech tasks', async () => {
      // Mock API calls for two TTS tasks
      (global.fetch as ReturnType<typeof vi.fn>)
        // First task - create
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechCreationResponse))
        // First task - check status
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.done))
        // Second task - create
        .mockImplementationOnce(() => mockFetchPromise({
          ...mockTextToSpeechCreationResponse,
          id: 'tts-654321'
        }))
        // Second task - check status
        .mockImplementationOnce(() => mockFetchPromise({
          ...mockTextToSpeechResults.done,
          id: 'tts-654321'
        }));
      
      // Mock timers
      vi.useFakeTimers();
      
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
      const resultPromise = batchProcessor.processTextToSpeechBatch(ttsTasks);
      
      // Fast forward time to complete all tasks
      vi.advanceTimersByTime(5000);
      
      // Get the final result
      const result = await resultPromise;
      
      // Verify result structure
      expect(result.successes.length).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);
      
      // Restore timers
      vi.useRealTimers();
    });
  });
    describe('processAiEditingBatch', () => {
    it('should process multiple AI editing tasks', async () => {
      // Mock API calls for two AI editing tasks
      (global.fetch as ReturnType<typeof vi.fn>)
        // First task - create
        .mockImplementationOnce(() => mockFetchPromise(mockAiEditingCreationResponse))
        // First task - check status
        .mockImplementationOnce(() => mockFetchPromise(mockAiEditingResults.done))
        // Second task - create
        .mockImplementationOnce(() => mockFetchPromise({
          ...mockAiEditingCreationResponse,
          id: 'edit-654321'
        }))
        // Second task - check status
        .mockImplementationOnce(() => mockFetchPromise({
          ...mockAiEditingResults.done,
          id: 'edit-654321'
        }));
      
      // Mock timers
      vi.useFakeTimers();
      
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
      const resultPromise = batchProcessor.processAiEditingBatch(aiEditingTasks);
      
      // Fast forward time to complete all tasks
      vi.advanceTimersByTime(5000);
      
      // Get the final result
      const result = await resultPromise;
      
      // Verify result structure
      expect(result.successes.length).toBe(2);
      expect(result.errors).toEqual([]);
      expect(result.allSuccessful).toBe(true);
      
      // Restore timers
      vi.useRealTimers();
    });
  });
});
