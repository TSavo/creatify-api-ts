import { CustomTemplatesApi } from '../../src/api/custom-templates';
import { 
  mockCustomTemplateCreationResponse,
  mockCustomTemplateResults
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

describe('CustomTemplatesApi', () => {
  let customTemplatesApi: CustomTemplatesApi;
  
  beforeEach(() => {
    customTemplatesApi = new CustomTemplatesApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    });
    
    // Clear mock history
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  });
  
  describe('createCustomTemplate', () => {
    it('should create a custom template video', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateCreationResponse));
      
      const params = {
        visual_style: 'HouseSale',
        data: {
          address: '123 Maple Avenue',
          city: 'Los Angeles',
          state: 'CA',
          price: 950000,
          bedrooms: 4,
          bathrooms: 3
        }
      };
      
      const result = await customTemplatesApi.createCustomTemplate(params);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/custom_templates/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      expect(result).toEqual(mockCustomTemplateCreationResponse);
    });
  });
  
  describe('getCustomTemplate', () => {
    it('should fetch a custom template task by ID', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateResults.done));
      
      const result = await customTemplatesApi.getCustomTemplate('template-123456');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/custom_templates/template-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockCustomTemplateResults.done);
    });
  });
  
  describe('getCustomTemplateList', () => {
    it('should fetch all custom template tasks', async () => {
      const mockTemplateList = [mockCustomTemplateResults.done, mockCustomTemplateResults.processing];
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockTemplateList));
      
      const result = await customTemplatesApi.getCustomTemplateList();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.creatify.ai/api/custom_templates/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      expect(result).toEqual(mockTemplateList);
    });
  });
  
  describe('createAndWaitForCustomTemplate', () => {
    it('should create a custom template video and wait for completion', async () => {
      // Mock multiple fetch calls for the create and polling sequence
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateResults.pending))
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateResults.processing))
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateResults.done));
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        visual_style: 'HouseSale',
        data: {
          address: '123 Maple Avenue',
          city: 'Los Angeles',
          state: 'CA',
          price: 950000,
          bedrooms: 4,
          bathrooms: 3
        }
      };
      
      // Start the async process
      const resultPromise = customTemplatesApi.createAndWaitForCustomTemplate(params, 1000);
      
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
      
      // First call should create the custom template task
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.creatify.ai/api/custom_templates/',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(params)
        })
      );
      
      // Subsequent calls should poll for status
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.creatify.ai/api/custom_templates/template-123456/',
        expect.objectContaining({
          method: 'GET'
        })
      );
      
      // Final result should be the completed custom template task
      expect(result).toEqual(mockCustomTemplateResults.done);
    });
    
    it('should handle error responses', async () => {
      // Mock fetch to return an error response
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateResults.error));
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        visual_style: 'HouseSale',
        data: {
          address: '123 Maple Avenue',
          city: 'Los Angeles',
          state: 'CA',
          price: 950000,
          bedrooms: 4,
          bathrooms: 3
        }
      };
      
      // Start the async process
      const resultPromise = customTemplatesApi.createAndWaitForCustomTemplate(params, 1000);
      
      // Fast forward timers to simulate waiting
      vi.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      vi.useRealTimers();
      
      // Final result should be the error response
      expect(result).toEqual(mockCustomTemplateResults.error);
    });
    
    it('should throw an error if max attempts is reached', async () => {
      // Mock fetch to always return pending status
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateCreationResponse))
        .mockImplementation(() => mockFetchPromise(mockCustomTemplateResults.pending));
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        visual_style: 'HouseSale',
        data: {
          address: '123 Maple Avenue',
          city: 'Los Angeles',
          state: 'CA',
          price: 950000,
          bedrooms: 4,
          bathrooms: 3
        }
      };
      
      // Start the async process with only 3 max attempts
      const resultPromise = customTemplatesApi.createAndWaitForCustomTemplate(params, 1000, 3);
      
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
