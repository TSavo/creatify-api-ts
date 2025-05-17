import { CustomTemplatesApi } from '../../src/api/custom-templates';
import { 
  mockCustomTemplateResponse,
  mockCustomTemplateResultResponse
} from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CustomTemplatesApi', () => {
  let customTemplatesApi: CustomTemplatesApi;
  let mockClient: MockCreatifyApiClient;
  
  beforeEach(() => {
    // Create a new instance of the CustomTemplatesApi with the mock factory
    customTemplatesApi = new CustomTemplatesApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    }, mockApiClientFactory);
    
    // Get the mock client that was created
    mockClient = mockApiClientFactory.getLastCreatedClient() as MockCreatifyApiClient;
    
    // Reset mock history
    mockClient.reset();
  });
  
  describe('createCustomTemplate', () => {
    it('should create a custom template task', async () => {      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockCustomTemplateResponse);
      
      const params = {
        template_id: 'template-123',
        variables: {
          name: 'John Doe',
          company: 'Acme Inc.'
        }
      };
      
      const result = await customTemplatesApi.createCustomTemplate(params);
      
      expect(mockClient.post).toHaveBeenCalledWith('/api/custom_templates/', params);
      expect(result).toEqual(mockCustomTemplateResponse);
    });
  });
  
  describe('getCustomTemplate', () => {
    it('should fetch a custom template task by ID', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockCustomTemplateResults.done);
      
      const result = await customTemplatesApi.getCustomTemplate('template-123456');
      
      expect(mockClient.get).toHaveBeenCalledWith('/api/custom_templates/template-123456/');
      expect(result).toEqual(mockCustomTemplateResults.done);
    });
  });
  
  describe('getCustomTemplateList', () => {
    it('should fetch all custom template tasks', async () => {
      const mockTemplateList = [mockCustomTemplateResults.done, mockCustomTemplateResults.processing];
      mockClient.get.mockResolvedValueOnce(mockTemplateList);
      
      const result = await customTemplatesApi.getCustomTemplateList();
      
      expect(mockClient.get).toHaveBeenCalledWith('/api/custom_templates/');
      expect(result).toEqual(mockTemplateList);
    });
  });
  
  describe('createAndWaitForCustomTemplate', () => {
    it('should create a custom template task and wait for completion', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockCustomTemplateCreationResponse);
      mockClient.get
        .mockResolvedValueOnce(mockCustomTemplateResults.pending)
        .mockResolvedValueOnce(mockCustomTemplateResults.processing)
        .mockResolvedValueOnce(mockCustomTemplateResults.done);
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        template_id: 'template-123',
        variables: {
          name: 'John Doe',
          company: 'Acme Inc.'
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
      
      // Verify the method calls
      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith('/api/custom_templates/', params);
      
      expect(mockClient.get).toHaveBeenCalledTimes(3);
      expect(mockClient.get).toHaveBeenCalledWith('/api/custom_templates/template-123456/');
      
      // Final result should be the completed custom template task
      expect(result).toEqual(mockCustomTemplateResults.done);
    });
    
    it('should handle error responses', async () => {
      // Mock the post and get methods to return an error response
      mockClient.post.mockResolvedValueOnce(mockCustomTemplateCreationResponse);
      mockClient.get.mockResolvedValueOnce(mockCustomTemplateResults.error);
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        template_id: 'template-123',
        variables: {
          name: 'John Doe',
          company: 'Acme Inc.'
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
      // Mock the post and get methods to always return pending status
      mockClient.post.mockResolvedValueOnce(mockCustomTemplateCreationResponse);
      mockClient.get.mockResolvedValue(mockCustomTemplateResults.pending);
      
      // Mock timers
      vi.useFakeTimers();
      
      const params = {
        template_id: 'template-123',
        variables: {
          name: 'John Doe',
          company: 'Acme Inc.'
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