import { AudioProcessor } from '../../src/utils/audio-processor';
import { mockTextToSpeechCreationResponse, mockTextToSpeechResults } from '../mocks/api-responses';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TextToSpeechApi } from '../../src/api/text-to-speech';

// Mock the TextToSpeechApi class
vi.mock('../../src/api/text-to-speech', () => {
  return {
    TextToSpeechApi: vi.fn().mockImplementation(() => ({
      createTextToSpeech: vi.fn(),
      getTextToSpeech: vi.fn(),
      getTextToSpeechList: vi.fn(),
      createAndWaitForTextToSpeech: vi.fn()
    }))
  };
});

describe('AudioProcessor', () => {
  let audioProcessor: AudioProcessor;
  let mockApi: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create a new instance of AudioProcessor
    audioProcessor = new AudioProcessor('test-api-id', 'test-api-key');

    // Get the mocked TextToSpeechApi instance
    mockApi = (TextToSpeechApi as any).mock.results[0].value;
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
      // Setup mock return value
      mockApi.createTextToSpeech.mockResolvedValueOnce(mockTextToSpeechCreationResponse);

      const result = await audioProcessor.generateAudio(
        'Hello, this is a test of the audio processor.',
        '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
        false // Don't wait for completion
      );

      // Verify the API was called with correct parameters
      expect(mockApi.createTextToSpeech).toHaveBeenCalledWith({
        script: 'Hello, this is a test of the audio processor.',
        accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
      });

      // Verify the result
      expect(result).toEqual(mockTextToSpeechCreationResponse);
    });

    it('should generate audio from text and wait for completion', async () => {
      // Setup mock return value
      mockApi.createAndWaitForTextToSpeech.mockResolvedValueOnce(mockTextToSpeechResults.done);

      // Call the method with wait=true
      const result = await audioProcessor.generateAudio(
        'Hello, this is a test of the audio processor.',
        '6f8ca7a8-87b9-4f5d-905d-cc4598e79717',
        true // Wait for completion
      );

      // Verify the API was called with correct parameters
      expect(mockApi.createAndWaitForTextToSpeech).toHaveBeenCalledWith({
        script: 'Hello, this is a test of the audio processor.',
        accent: '6f8ca7a8-87b9-4f5d-905d-cc4598e79717'
      });

      // Final result should be the completed audio
      expect(result).toEqual(mockTextToSpeechResults.done);
    });
  });

  describe('checkAudioStatus', () => {
    it('should check the status of an audio generation task', async () => {
      // Setup mock return value
      mockApi.getTextToSpeech.mockResolvedValueOnce(mockTextToSpeechResults.done);

      // Call the method
      const result = await audioProcessor.checkAudioStatus('tts-123456');

      // Verify the API was called with correct parameters
      expect(mockApi.getTextToSpeech).toHaveBeenCalledWith('tts-123456');

      // Verify the result
      expect(result).toEqual(mockTextToSpeechResults.done);
    });
  });

  describe('waitForAudioCompletion', () => {
    it('should poll for audio generation completion', async () => {
      // Setup mock sequence of return values
      mockApi.getTextToSpeech
        .mockResolvedValueOnce(mockTextToSpeechResults.pending)
        .mockResolvedValueOnce(mockTextToSpeechResults.done);

      // Start the async process with a short polling interval
      const result = await audioProcessor.waitForAudioCompletion('tts-123456', 100);

      // Verify the API was called with correct parameters
      expect(mockApi.getTextToSpeech).toHaveBeenCalledWith('tts-123456');

      // Final result should be the completed audio
      expect(result).toEqual(mockTextToSpeechResults.done);
    }, 10000); // Increase timeout

    it('should handle error responses', async () => {
      // Setup mock return value
      mockApi.getTextToSpeech.mockResolvedValueOnce(mockTextToSpeechResults.error);

      // Call the method
      const result = await audioProcessor.waitForAudioCompletion('tts-123456', 100);

      // Verify the API was called with correct parameters
      expect(mockApi.getTextToSpeech).toHaveBeenCalledWith('tts-123456');

      // Final result should be the error response
      expect(result).toEqual(mockTextToSpeechResults.error);
    }, 10000); // Increase timeout

    it('should throw an error if max attempts is reached', async () => {
      // Setup mock to always return pending status
      mockApi.getTextToSpeech.mockResolvedValue(mockTextToSpeechResults.pending);

      // Create a function that will throw the expected error
      const audioProcessorWaitFn = async () => {
        // Use a very small number of attempts to make the test run faster
        return await audioProcessor.waitForAudioCompletion('tts-123456', 10, 2);
      };

      // Expect the function to throw an error due to timeout
      await expect(audioProcessorWaitFn()).rejects.toThrow(/did not complete within the timeout period/);
    }, 10000); // Increase timeout
  });

  describe('listAudioTasks', () => {
    it('should list all audio generation tasks', async () => {
      // Setup mock return value
      const mockTtsList = [mockTextToSpeechResults.done, mockTextToSpeechResults.processing];
      mockApi.getTextToSpeechList.mockResolvedValueOnce(mockTtsList);

      // Call the method
      const result = await audioProcessor.listAudioTasks();

      // Verify the API was called
      expect(mockApi.getTextToSpeechList).toHaveBeenCalled();

      // Verify the result
      expect(result).toEqual(mockTtsList);
    });
  });
});
