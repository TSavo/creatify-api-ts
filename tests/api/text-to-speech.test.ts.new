import { TextToSpeechApi } from '../../src/api/text-to-speech';
import { 
  mockTextToSpeechCreationResponse,
  mockTextToSpeechResults
} from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TextToSpeechApi', () => {
  let ttsApi: TextToSpeechApi;
  let mockClient: MockCreatifyApiClient;
  
  beforeEach(() => {
    // Create a new instance of the TextToSpeechApi with the mock factory
    ttsApi = new TextToSpeechApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    }, mockApiClientFactory);
    
    // Get the mock client that was created
    mockClient = mockApiClientFactory.getLastCreatedClient() as MockCreatifyApiClient;
    
    // Reset mock history
    mockClient.reset();
  });
  
  describe('createTextToSpeech', () => {
    it('should create a text-to-speech task', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockTextToSpeechCreationResponse);
      
      const params = {
        script: 'Hello, this is a test of the text-to-speech API.',
        accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
      };
      
      const result = await ttsApi.createTextToSpeech(params);
      
      expect(mockClient.post).toHaveBeenCalledWith('/api/text_to_speech/', params);
      expect(result).toEqual(mockTextToSpeechCreationResponse);
    });
  });
  
  describe('getTextToSpeech', () => {
    it('should fetch a text-to-speech task by ID', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockTextToSpeechResults.done);
      
      const result = await ttsApi.getTextToSpeech('tts-123456');
      
      expect(mockClient.get).toHaveBeenCalledWith('/api/text_to_speech/tts-123456/');
      expect(result).toEqual(mockTextToSpeechResults.done);
    });
  });
  
  describe('getTextToSpeechList', () => {
    it('should fetch all text-to-speech tasks', async () => {
      const mockTtsList = [mockTextToSpeechResults.done, mockTextToSpeechResults.processing];
      mockClient.get.mockResolvedValueOnce(mockTtsList);
      
      const result = await ttsApi.getTextToSpeechList();
      
      expect(mockClient.get).toHaveBeenCalledWith('/api/text_to_speech/', { page: undefined, limit: undefined });
      expect(result).toEqual(mockTtsList);
    });
    
    it('should accept pagination parameters', async () => {
      const mockTtsList = [mockTextToSpeechResults.done];
      mockClient.get.mockResolvedValueOnce(mockTtsList);
      
      const result = await ttsApi.getTextToSpeechList(2, 10);
      
      expect(mockClient.get).toHaveBeenCalledWith('/api/text_to_speech/', { page: 2, limit: 10 });
      expect(result).toEqual(mockTtsList);
    });
  });
  
  describe('getTextToSpeechPaginated', () => {
    it('should fetch paginated text-to-speech data', async () => {
      const mockPaginatedResponse = {
        count: 2,
        next: null,
        previous: null,
        results: [mockTextToSpeechResults.done, mockTextToSpeechResults.processing]
      };
      
      mockClient.get.mockResolvedValueOnce(mockPaginatedResponse);
      
      const result = await ttsApi.getTextToSpeechPaginated();
      
      expect(mockClient.get).toHaveBeenCalledWith('/api/text_to_speech/paginated/', { page: 1, limit: 20 });
      expect(result).toEqual(mockPaginatedResponse);
    });
  });
  
  describe('createAndWaitForTextToSpeech', () => {
    it('should create a text-to-speech task and wait for completion', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockTextToSpeechCreationResponse);
      mockClient.get
        .mockResolvedValueOnce(mockTextToSpeechResults.pending)
        .mockResolvedValueOnce(mockTextToSpeechResults.processing)
        .mockResolvedValueOnce(mockTextToSpeechResults.done);
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        script: 'Hello, this is a test of the text-to-speech API.',
        accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
      };
      
      // Start the async process
      const resultPromise = ttsApi.createAndWaitForTextToSpeech(params, 1000);
      
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
      expect(mockClient.post).toHaveBeenCalledWith('/api/text_to_speech/', params);
      
      expect(mockClient.get).toHaveBeenCalledTimes(3);
      expect(mockClient.get).toHaveBeenCalledWith('/api/text_to_speech/tts-123456/');
      
      // Final result should be the completed text-to-speech
      expect(result).toEqual(mockTextToSpeechResults.done);
    });
    
    it('should handle error responses', async () => {
      // Mock the post and get methods to return an error response
      mockClient.post.mockResolvedValueOnce(mockTextToSpeechCreationResponse);
      mockClient.get.mockResolvedValueOnce(mockTextToSpeechResults.error);
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        script: 'Hello, this is a test of the text-to-speech API.',
        accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
      };
      
      // Start the async process
      const resultPromise = ttsApi.createAndWaitForTextToSpeech(params, 1000);
      
      // Fast forward timers to simulate waiting
      vi.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      vi.useRealTimers();
      
      // Final result should be the error response
      expect(result).toEqual(mockTextToSpeechResults.error);
    });
    
    it('should throw an error if max attempts is reached', async () => {
      // Mock the post and get methods to always return pending status
      mockClient.post.mockResolvedValueOnce(mockTextToSpeechCreationResponse);
      mockClient.get.mockResolvedValue(mockTextToSpeechResults.pending);
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        script: 'Hello, this is a test of the text-to-speech API.',
        accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
      };
      
      // Start the async process with only 3 max attempts
      const resultPromise = ttsApi.createAndWaitForTextToSpeech(params, 1000, 3);
      
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
