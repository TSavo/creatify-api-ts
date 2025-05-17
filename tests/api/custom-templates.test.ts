import { CustomTemplatesApi } from '../../src/api/custom-templates';
import { 
  mockCustomTemplateCreationResponse,
  mockCustomTemplateResults
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

describe('CustomTemplatesApi', () => {
  let customTemplatesApi: CustomTemplatesApi;
  
  beforeEach(() => {
    customTemplatesApi = new CustomTemplatesApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    });
    
    // Clear mock history
    (global.fetch as jest.Mock).mockClear();
  });
  
  describe('createCustomTemplate', () => {
    it('should create a custom template video', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateCreationResponse));
      
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
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateResults.done));
      
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
      (global.fetch as jest.Mock).mockImplementationOnce(() => mockFetchPromise(mockTemplateList));
      
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
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateResults.pending))
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateResults.processing))
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateResults.done));
      
      // Mock timers
      jest.useFakeTimers();
      
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
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      jest.useRealTimers();
      
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
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateCreationResponse))
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateResults.error));
      
      // Mock timers
      jest.useFakeTimers();
      
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
      jest.advanceTimersByTime(1000);
      
      // Await the final result
      const result = await resultPromise;
      
      // Restore timers
      jest.useRealTimers();
      
      // Final result should be the error response
      expect(result).toEqual(mockCustomTemplateResults.error);
    });
    
    it('should throw an error if max attempts is reached', async () => {
      // Mock fetch to always return pending status
      (global.fetch as jest.Mock)
        .mockImplementationOnce(() => mockFetchPromise(mockCustomTemplateCreationResponse))
        .mockImplementation(() => mockFetchPromise(mockCustomTemplateResults.pending));
      
      // Mock timers
      jest.useFakeTimers();
      
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
        jest.advanceTimersByTime(1000);
      }
      
      // Expect the function to throw an error due to timeout
      await expect(resultPromise).rejects.toThrow(/did not complete within the timeout period/);
      
      // Restore timers
      jest.useRealTimers();
    });
  });
});
