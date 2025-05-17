import { AudioProcessor } from '../../src/utils/audio-processor';
import { mockTextToSpeechCreationResponse, mockTextToSpeechResults } from '../mocks/api-responses';

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

describe('AudioProcessor', () => {
  let audioProcessor: AudioProcessor;
  
  beforeEach(() => {
    audioProcessor = new AudioProcessor('test-api-id', 'test-api-key');
    
    // Clear mock history
    (global.fetch as jest.Mock).mockClear();
  });
  
  describe('constructor', () => {
    it('should initialize with API credentials as separate parameters', () => {
      const processor = new AudioProcessor('test-api-id', 'test-api-key');
      expect(processor).toBeDefined();
    });
    
    it('should initialize with API credentials as an options object', () => {
      const processor = new AudioProcessor({
        apiId: 'test-api-id',
        apiKey: 'test-api-key'
      });
      expect(processor).toBeDefined();
    });
  });
  
  describe('generateAudio', () => {
    it('should generate audio from text without waiting for completion', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechCreationResponse));
      
      const result = await audioProcessor.generateAudio(
        'Hello, this is a test of the audio processor.',
        '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
        false // Don't wait for completion
      );
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/text_to_speech/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            script: 'Hello, this is a test of the audio processor.',
            accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
          })
        })
      );
      
      expect(result).toEqual(mockTextToSpeechCreationResponse);
    });
    
    it('should generate audio from text and wait for completion', async () => {
      // Mock multiple fetch calls for the create and polling sequence
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.pending))
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.done));
      
      // Mock timers
      jest.useFakeTimers();
      
      // Start the async process
      const resultPromise = audioProcessor.generateAudio(
        'Hello, this is a test of the audio processor.',
        '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
        true // Wait for completion
      );
      
      // Fast forward timers to simulate waiting
      jest.advanceTimersByTime(2000);
      jest.advanceTimersByTime(2000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      jest.useRealTimers();
      
      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(3);
      
      // Final result should be the completed audio
      expect(result).toEqual(mockTextToSpeechResults.done);
    });
  });
  
  describe('checkAudioStatus', () => {
    it('should check the status of an audio generation task', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.done));
      
      const result = await audioProcessor.checkAudioStatus('tts-123456');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/text_to_speech/tts-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockTextToSpeechResults.done);
    });
  });
  
  describe('waitForAudioCompletion', () => {
    it('should poll for audio generation completion', async () => {
      // Mock multiple fetch calls for the polling sequence
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.pending))
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.processing))
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.done));
      
      // Mock timers
      jest.useFakeTimers();
      
      // Start the async process
      const resultPromise = audioProcessor.waitForAudioCompletion('tts-123456', 1000);
      
      // Fast forward timers to simulate waiting
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      jest.useRealTimers();
      
      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(3);
      
      // All calls should check the task status
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.creatify.ai/api/text_to_speech/tts-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      // Final result should be the completed audio
      expect(result).toEqual(mockTextToSpeechResults.done);
    });
    
    it('should handle error responses', async () => {
      // Mock fetch to return an error response
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockTextToSpeechResults.error));
      
      // Mock timers
      jest.useFakeTimers();
      
      // Start the async process
      const resultPromise = audioProcessor.waitForAudioCompletion('tts-123456', 1000);
      
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
        .mockImplementation(() => mockFetchPromise(mockTextToSpeechResults.pending));
      
      // Mock timers
      jest.useFakeTimers();
      
      // Start the async process with only 3 max attempts
      const resultPromise = audioProcessor.waitForAudioCompletion('tts-123456', 1000, 3);
      
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
  
  describe('listAudioTasks', () => {
    it('should list all audio generation tasks', async () => {
      const mockTtsList = [mockTextToSpeechResults.done, mockTextToSpeechResults.processing];
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockTtsList));
      
      const result = await audioProcessor.listAudioTasks();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/text_to_speech/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockTtsList);
    });
  });
});
