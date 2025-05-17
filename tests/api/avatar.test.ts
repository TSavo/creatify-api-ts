import { AvatarApi } from '../../src/api/avatar';
import { 
  mockAvatars, 
  mockVoices, 
  mockLipsyncCreationResponse, 
  mockLipsyncResults 
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

describe('AvatarApi', () => {
  let avatarApi: AvatarApi;
  
  beforeEach(() => {
    avatarApi = new AvatarApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    });
    
    // Clear mock history
    (global.fetch as jest.Mock).mockClear();
  });
  
  describe('getAvatars', () => {
    it('should fetch available avatars', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockAvatars));
      
      const result = await avatarApi.getAvatars();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/creators/',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-API-ID': 'test-api-id',
            'X-API-KEY': 'test-api-key'
          })
        })
      );
      
      expect(result).toEqual(mockAvatars);
    });
  });
  
  describe('getVoices', () => {
    it('should fetch available voices', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockVoices));
      
      const result = await avatarApi.getVoices();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/voices/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockVoices);
    });
  });
  
  describe('createLipsync', () => {
    it('should create a lipsync video', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockLipsyncCreationResponse));
      
      const params = {
        text: 'Hello world!',
        creator: mockAvatars[0].avatar_id,
        aspect_ratio: '16:9' as any,
        voice_id: mockVoices[0].voice_id
      };
      
      const result = await avatarApi.createLipsync(params);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/lipsync/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      expect(result).toEqual(mockLipsyncCreationResponse);
    });
  });
  
  describe('getLipsync', () => {
    it('should fetch a lipsync task by ID', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockLipsyncResults.done));
      
      const result = await avatarApi.getLipsync('lipsync-123456');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/lipsync/lipsync-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockLipsyncResults.done);
    });
  });
  
  describe('getLipsyncs', () => {
    it('should fetch all lipsync tasks', async () => {
      const mockLipsyncList = [mockLipsyncResults.done, mockLipsyncResults.processing];
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockLipsyncList));
      
      const result = await avatarApi.getLipsyncs();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/lipsync/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockLipsyncList);
    });
  });
  
  describe('createMultiAvatarLipsync', () => {
    it('should create a multi-avatar lipsync video', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockLipsyncCreationResponse));
      
      const params = {
        video_inputs: [
          {
            character: {
              type: 'avatar' as const,
              avatar_id: mockAvatars[0].avatar_id,
              avatar_style: 'normal'
            },
            voice: {
              type: 'text' as const,
              input_text: 'Hello from the first avatar!',
              voice_id: mockVoices[0].voice_id
            },
            background: {
              type: 'image' as const,
              url: 'https://example.com/background.jpg'
            }
          },
          {
            character: {
              type: 'avatar' as const,
              avatar_id: mockAvatars[1].avatar_id,
              avatar_style: 'casual'
            },
            voice: {
              type: 'text' as const,
              input_text: 'And hello from the second avatar!',
              voice_id: mockVoices[1].voice_id
            },
            background: {
              type: 'image' as const,
              url: 'https://example.com/background.jpg'
            }
          }
        ],
        aspect_ratio: '16:9' as any
      };
      
      const result = await avatarApi.createMultiAvatarLipsync(params);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/multi_avatar_lipsync/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      expect(result).toEqual(mockLipsyncCreationResponse);
    });
  });
  
  describe('createAndWaitForLipsync', () => {
    it('should create a lipsync and wait for completion', async () => {
      // Mock multiple fetch calls for the create and polling sequence
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncResults.pending))
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncResults.processing))
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncResults.done));
      
      // Mock timers
      jest.useFakeTimers();
      
      const params = {
        text: 'Hello world!',
        creator: mockAvatars[0].avatar_id
      };
      
      // Start the async process
      const resultPromise = avatarApi.createAndWaitForLipsync(params, 1000);
      
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
      
      // First call should create the lipsync
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.creatify.ai/api/lipsync/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      // Subsequent calls should poll for status
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.creatify.ai/api/lipsync/lipsync-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      // Final result should be the completed lipsync
      expect(result).toEqual(mockLipsyncResults.done);
    });
    
    it('should throw an error if max attempts is reached', async () => {
      // Mock fetch to always return pending status
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockLipsyncCreationResponse))
        .mockImplementation(() => mockFetchPromise(mockLipsyncResults.pending));
      
      // Mock timers
      jest.useFakeTimers();
      
      const params = {
        text: 'Hello world!',
        creator: mockAvatars[0].avatar_id
      };
      
      // Start the async process with only 3 max attempts
      const resultPromise = avatarApi.createAndWaitForLipsync(params, 1000, 3);
      
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
