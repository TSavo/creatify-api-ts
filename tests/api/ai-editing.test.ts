import { AiEditingApi } from '../../src/api/ai-editing';
import { 
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

describe('AiEditingApi', () => {
  let aiEditingApi: AiEditingApi;
  
  beforeEach(() => {
    aiEditingApi = new AiEditingApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    });
    
    // Clear mock history
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  });
  
  describe('createAiEditing', () => {
    it('should create an AI editing task', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockAiEditingCreationResponse));
      
      const params = {
        video_url: 'https://example.com/video.mp4',
        editing_style: 'film' as any
      };
      
      const result = await aiEditingApi.createAiEditing(params);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/ai_editing/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      expect(result).toEqual(mockAiEditingCreationResponse);
    });
  });
  
  describe('getAiEditing', () => {
    it('should fetch an AI editing task by ID', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockAiEditingResults.done));
      
      const result = await aiEditingApi.getAiEditing('edit-123456');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/ai_editing/edit-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockAiEditingResults.done);
    });
  });
  
  describe('getAiEditingList', () => {
    it('should fetch all AI editing tasks', async () => {
      const mockAiEditingList = [mockAiEditingResults.done, mockAiEditingResults.processing];
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockAiEditingList));
      
      const result = await aiEditingApi.getAiEditingList();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/ai_editing/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockAiEditingList);
    });
  });
  
  describe('createAndWaitForAiEditing', () => {
    it('should create an AI editing task and wait for completion', async () => {
      // Mock multiple fetch calls for the create and polling sequence
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockImplementationOnce(() => mockFetchPromise(mockAiEditingCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockAiEditingResults.pending))
        .mockImplementationOnce(() => mockFetchPromise(mockAiEditingResults.processing))
        .mockImplementationOnce(() => mockFetchPromise(mockAiEditingResults.done));
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        video_url: 'https://example.com/video.mp4',
        editing_style: 'film' as any
      };
      
      // Start the async process
      const resultPromise = aiEditingApi.createAndWaitForAiEditing(params, 1000);
      
      // Fast forward timers to simulate waiting
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      vi.useRealTimers();
      
      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(4);
      
      // First call should create the AI editing task
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.creatify.ai/api/ai_editing/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      // Subsequent calls should poll for status
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.creatify.ai/api/ai_editing/edit-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      // Final result should be the completed AI editing task
      expect(result).toEqual(mockAiEditingResults.done);
    });
    
    it('should handle error responses', async () => {
      // Mock fetch to return an error response
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockImplementationOnce(() => mockFetchPromise(mockAiEditingCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockAiEditingResults.error));
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        video_url: 'https://example.com/video.mp4',
        editing_style: 'film' as any
      };
      
      // Start the async process
      const resultPromise = aiEditingApi.createAndWaitForAiEditing(params, 1000);
      
      // Fast forward timers to simulate waiting
      vi.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      vi.useRealTimers();
      
      // Final result should be the error response
      expect(result).toEqual(mockAiEditingResults.error);
    });
    
    it('should throw an error if max attempts is reached', async () => {
      // Mock fetch to always return pending status
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockImplementationOnce(() => mockFetchPromise(mockAiEditingCreationResponse))
        .mockImplementation(() => mockFetchPromise(mockAiEditingResults.pending));
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        video_url: 'https://example.com/video.mp4',
        editing_style: 'film' as any
      };
      
      // Start the async process with only 3 max attempts
      const resultPromise = aiEditingApi.createAndWaitForAiEditing(params, 1000, 3);
      
      // Fast forward timers to simulate waiting
      for (let i = 0; i < 3; i++) {
        vi.advanceTimersByTime(1000);
      }
      
      // Expect the function to throw an error due to timeout
      await expect(resultPromise).rejects.toThrow(/did not complete within the timeout period/);
      
      // Restore timers
      vi.useRealTimers();
    });
  });
});
