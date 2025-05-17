import { AiEditingApi } from '../../src/api/ai-editing';
import { 
  mockAiEditingCreationResponse,
  mockAiEditingResults
} from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AiEditingApi', () => {
  let aiEditingApi: AiEditingApi;
  let mockClient: MockCreatifyApiClient;
  
  beforeEach(() => {
    // Create a new instance of the AiEditingApi with the mock factory
    aiEditingApi = new AiEditingApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    }, mockApiClientFactory);
    
    // Get the mock client that was created
    mockClient = mockApiClientFactory.getLastCreatedClient() as MockCreatifyApiClient;
    
    // Reset mock history
    mockClient.reset();
  });
  
  describe('createAiEditing', () => {
    it('should create an AI editing task', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockAiEditingCreationResponse);
      
      const params = {
        video_url: 'https://example.com/video.mp4',
        editing_style: 'film' as any
      };
      
      const result = await aiEditingApi.createAiEditing(params);
      
      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_editing/', params);
      expect(result).toEqual(mockAiEditingCreationResponse);
    });
  });
  
  describe('getAiEditing', () => {
    it('should fetch an AI editing task by ID', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockAiEditingResults.done);
      
      const result = await aiEditingApi.getAiEditing('edit-123456');
      
      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_editing/edit-123456/');
      expect(result).toEqual(mockAiEditingResults.done);
    });
  });
  
  describe('getAiEditingList', () => {
    it('should fetch all AI editing tasks', async () => {
      const mockEditList = [mockAiEditingResults.done, mockAiEditingResults.processing];
      mockClient.get.mockResolvedValueOnce(mockEditList);
      
      const result = await aiEditingApi.getAiEditingList();
      
      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_editing/');
      expect(result).toEqual(mockEditList);
    });
  });
  
  describe('createAndWaitForAiEditing', () => {
    it('should create an AI editing task and wait for completion', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockAiEditingCreationResponse);
      mockClient.get
        .mockResolvedValueOnce(mockAiEditingResults.pending)
        .mockResolvedValueOnce(mockAiEditingResults.processing)
        .mockResolvedValueOnce(mockAiEditingResults.done);
      
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
      
      // Verify the method calls
      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith('/api/ai_editing/', params);
      
      expect(mockClient.get).toHaveBeenCalledTimes(3);
      expect(mockClient.get).toHaveBeenCalledWith('/api/ai_editing/edit-123456/');
      
      // Final result should be the completed AI editing task
      expect(result).toEqual(mockAiEditingResults.done);
    });
    
    it('should handle error responses', async () => {
      // Mock the post and get methods to return an error response
      mockClient.post.mockResolvedValueOnce(mockAiEditingCreationResponse);
      mockClient.get.mockResolvedValueOnce(mockAiEditingResults.error);
      
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
      // Mock the post and get methods to always return pending status
      mockClient.post.mockResolvedValueOnce(mockAiEditingCreationResponse);
      mockClient.get.mockResolvedValue(mockAiEditingResults.pending);
      
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
