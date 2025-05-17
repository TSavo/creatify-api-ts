import { TextToSpeechApi } from '../../src/api/text-to-speech';
import { 
  mockTextToSpeechCreationResponse,
  mockTextToSpeechResults
} from '../mocks/api-responses';

// Mock fetch for testing
global.fetch = jest.fn();

// Create a mock Response
const mockJsonPromise = (data: any) => Promise.resolve(data);
const mockFetchPromise = (data: any, status = 200) => 
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => mockJsonPromise(data)
  } as Response);

describe('TextToSpeechApi', () => {
  let ttsApi: TextToSpeechApi;
  
  beforeEach(() => {
    ttsApi = new TextToSpeechApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    });
    
    // Clear mock history
    (global.fetch as jest.Mock).mockClear();
  });
  
  describe('createTextToSpeech', () => {
    it('should create a text-to-speech task', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechCreationResponse));
      
      const params = {
        script: 'Hello, this is a test of the text-to-speech API.',
        accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
      };
      
      const result = await ttsApi.createTextToSpeech(params);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/text_to_speech/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      expect(result).toEqual(mockTextToSpeechCreationResponse);
    });
  });
  
  describe('getTextToSpeech', () => {
    it('should fetch a text-to-speech task by ID', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.done));
      
      const result = await ttsApi.getTextToSpeech('tts-123456');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/text_to_speech/tts-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockTextToSpeechResults.done);
    });
  });
  
  describe('getTextToSpeechList', () => {
    it('should fetch all text-to-speech tasks', async () => {
      const mockTtsList = [mockTextToSpeechResults.done, mockTextToSpeechResults.processing];
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockTtsList));
      
      const result = await ttsApi.getTextToSpeechList();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/text_to_speech/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockTtsList);
    });
  });
  
  describe('createAndWaitForTextToSpeech', () => {
    it('should create a text-to-speech task and wait for completion', async () => {
      // Mock multiple fetch calls for the create and polling sequence
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.pending))
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.processing))
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.done));
      
      // Mock timers
      jest.useFakeTimers();
      
      const params = {
        script: 'Hello, this is a test of the text-to-speech API.',
        accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
      };
      
      // Start the async process
      const resultPromise = ttsApi.createAndWaitForTextToSpeech(params, 1000);
      
      // Fast forward timers to simulate waiting
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      jest.useRealTimers();
      
      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(4);
      
      // First call should create the text-to-speech task
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.creatify.ai/api/text_to_speech/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      // Subsequent calls should poll for status
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.creatify.ai/api/text_to_speech/tts-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      // Final result should be the completed text-to-speech
      expect(result).toEqual(mockTextToSpeechResults.done);
    });
    
    it('should handle error responses', async () => {
      // Mock fetch to return an error response
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.error));
      
      // Mock timers
      jest.useFakeTimers();
      
      const params = {
        script: 'Hello, this is a test of the text-to-speech API.',
        accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
      };
      
      // Start the async process
      const resultPromise = ttsApi.createAndWaitForTextToSpeech(params, 1000);
      
      // Fast forward timers to simulate waiting
      jest.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      jest.useRealTimers();
      
      // Final result should be the error response
      expect(result).toEqual(mockTextToSpeechResults.error);
    });
    
    it('should throw an error if max attempts is reached', async () => {
      // Mock fetch to always return pending status
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechCreationResponse))
        .mockImplementation(() => mockFetchPromise(mockTextToSpeechResults.pending));
      
      // Mock timers
      jest.useFakeTimers();
      
      const params = {
        script: 'Hello, this is a test of the text-to-speech API.',
        accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
      };
      
      // Start the async process with only 3 max attempts
      const resultPromise = ttsApi.createAndWaitForTextToSpeech(params, 1000, 3);
      
      // Fast forward timers to simulate waiting
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(1000);
      }
      
      // Expect the function to throw an error due to timeout
      await expect(resultPromise).rejects.toThrow(/did not complete within the timeout period/);
      
      // Restore timers
      jest.useRealTimers();
    });
  });
});
