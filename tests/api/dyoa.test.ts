import { DyoaApi } from '../../src/api/dyoa';
import { 
  mockDyoaCreationResponse,
  mockDyoaWithPhotos,
  mockDyoaSubmittedForReview,
  mockDyoaApproved,
  mockDyoaList
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

describe('DyoaApi', () => {
  let dyoaApi: DyoaApi;
  
  beforeEach(() => {
    dyoaApi = new DyoaApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    });
    
    // Clear mock history
    (global.fetch as jest.Mock).mockClear();
  });
  
  describe('createDyoa', () => {
    it('should create a DYOA with avatar details', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockDyoaCreationResponse));
      
      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop'
      };
      
      const result = await dyoaApi.createDyoa(params);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/dyoa/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      expect(result).toEqual(mockDyoaCreationResponse);
    });
  });
  
  describe('getDyoa', () => {
    it('should fetch a DYOA by ID', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockDyoaWithPhotos));
      
      const result = await dyoaApi.getDyoa('dyoa-123456');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/dyoa/dyoa-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockDyoaWithPhotos);
    });
  });
  
  describe('getDyoaList', () => {
    it('should fetch all DYOAs', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockDyoaList));
      
      const result = await dyoaApi.getDyoaList();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/dyoa/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockDyoaList);
    });
  });
  
  describe('submitDyoaForReview', () => {
    it('should submit a DYOA for review with the chosen photo', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockDyoaSubmittedForReview));
      
      const params = {
        chosen_photo_id: 'photo-1'
      };
      
      const result = await dyoaApi.submitDyoaForReview('dyoa-123456', params);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/dyoa/dyoa-123456/submit_for_review/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      expect(result).toEqual(mockDyoaSubmittedForReview);
    });
  });
  
  describe('deleteDyoa', () => {
    it('should delete a DYOA', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise({}));
      
      await dyoaApi.deleteDyoa('dyoa-123456');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/dyoa/dyoa-123456/',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });
  
  describe('createAndWaitForDyoaPhotos', () => {
    it('should create a DYOA and wait for photos to be generated', async () => {
      // Mock multiple fetch calls for the create and polling sequence
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise({...mockDyoaCreationResponse, status: 'initializing'}))
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaWithPhotos));
      
      // Mock timers
      jest.useFakeTimers();
      
      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop'
      };
      
      // Start the async process
      const resultPromise = dyoaApi.createAndWaitForDyoaPhotos(params, 1000);
      
      // Fast forward timers to simulate waiting
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      jest.useRealTimers();
      
      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(3);
      
      // First call should create the DYOA
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.creatify.ai/api/dyoa/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      // Subsequent calls should poll for photo generation
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.creatify.ai/api/dyoa/dyoa-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      // Final result should be the DYOA with photos
      expect(result).toEqual(mockDyoaWithPhotos);
    });
    
    it('should throw an error if max attempts is reached without photos', async () => {
      // Mock fetch to always return DYOA without photos
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaCreationResponse))
        .mockImplementation(() => mockFetchPromise({...mockDyoaCreationResponse, status: 'initializing'}));
      
      // Mock timers
      jest.useFakeTimers();
      
      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop'
      };
      
      // Start the async process with only 3 max attempts
      const resultPromise = dyoaApi.createAndWaitForDyoaPhotos(params, 1000, 3);
      
      // Fast forward timers to simulate waiting
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(1000);
      }
      
      // Expect the function to throw an error due to timeout
      await expect(resultPromise).rejects.toThrow(/photos were not generated within the timeout period/);
      
      // Restore timers
      jest.useRealTimers();
    });
  });
  
  describe('createSubmitAndWaitForDyoa', () => {
    it('should create a DYOA, wait for photos, submit for review and wait for approval', async () => {
      // Mock multiple fetch calls for the create, photo generation, submission, and review sequence
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaWithPhotos)) // Photos generated
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaSubmittedForReview)) // Submitted for review
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaSubmittedForReview)) // Still pending
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaApproved)); // Approved
      
      // Mock timers
      jest.useFakeTimers();
      
      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop'
      };
      
      // Start the async process with smaller intervals for testing
      const resultPromise = dyoaApi.createSubmitAndWaitForDyoa(
        params,
        0, // Use first photo
        1000, // Photo gen poll interval
        3,   // Photo gen max attempts
        1000, // Review poll interval
        3    // Review max attempts
      );
      
      // Fast forward timers to simulate waiting for photos
      jest.advanceTimersByTime(1000);
      
      // Fast forward timers to simulate waiting for review
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      jest.useRealTimers();
      
      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(5);
      
      // Final result should be the approved DYOA
      expect(result).toEqual(mockDyoaApproved);
    });
    
    it('should throw an error if no photos are generated', async () => {
      // Mock fetch to return DYOA with no photos
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise({
          ...mockDyoaCreationResponse,
          status: 'draft',
          photos: []
        }));
      
      // Mock timers
      jest.useFakeTimers();
      
      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop'
      };
      
      // Start the async process
      const resultPromise = dyoaApi.createSubmitAndWaitForDyoa(
        params,
        0,
        1000,
        1,
        1000,
        1
      );
      
      // Fast forward timers
      jest.advanceTimersByTime(1000);
      
      // Expect the function to throw an error due to no photos
      await expect(resultPromise).rejects.toThrow(/No photos were generated for the DYOA/);
      
      // Restore timers
      jest.useRealTimers();
    });
    
    it('should throw an error if review does not complete within timeout', async () => {
      // Mock fetch calls with stuck pending review
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaWithPhotos))
        .mockImplementationOnce(() => mockFetchPromise(mockDyoaSubmittedForReview))
        .mockImplementation(() => mockFetchPromise(mockDyoaSubmittedForReview)); // Always pending
      
      // Mock timers
      jest.useFakeTimers();
      
      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description: 'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop'
      };
      
      // Start the async process with small max attempts
      const resultPromise = dyoaApi.createSubmitAndWaitForDyoa(
        params,
        0,
        1000,
        1,
        1000,
        2 // Only 2 review poll attempts
      );
      
      // Fast forward timers for photo generation
      jest.advanceTimersByTime(1000);
      
      // Fast forward timers for review polling
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000);
      
      // Expect the function to throw an error due to review timeout
      await expect(resultPromise).rejects.toThrow(/review did not complete within the timeout period/);
      
      // Restore timers
      jest.useRealTimers();
    });
  });
});
