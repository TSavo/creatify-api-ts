import { CustomTemplatesApi } from '../../src/api/custom-templates';
import {
  mockCustomTemplateResponse,
  mockCustomTemplateResultResponse,
} from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CustomTemplatesApi', () => {
  let customTemplatesApi: CustomTemplatesApi;
  let mockClient: MockCreatifyApiClient;

  beforeEach(() => {
    // Create a new instance of the CustomTemplatesApi with the mock factory
    customTemplatesApi = new CustomTemplatesApi(
      {
        apiId: 'test-api-id',
        apiKey: 'test-api-key',
      },
      mockApiClientFactory
    );

    // Get the mock client that was created
    mockClient = mockApiClientFactory.getLastCreatedClient() as MockCreatifyApiClient;

    // Reset mock history
    mockClient.reset();
  });

  describe('createCustomTemplate', () => {
    it('should create a custom template task', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockCustomTemplateResponse);

      const params = {
        visual_style: 'modern-professional',
        data: {
          name: 'John Doe',
          company: 'Acme Inc.',
        },
      };

      const result = await customTemplatesApi.createCustomTemplate(params);

      expect(mockClient.post).toHaveBeenCalledWith('/api/custom_templates/', params);
      expect(result).toEqual(mockCustomTemplateResponse);
    });
  });

  describe('getCustomTemplate', () => {
    it('should fetch a custom template task by ID', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockCustomTemplateResultResponse);

      const result = await customTemplatesApi.getCustomTemplate('template-123456');

      expect(mockClient.get).toHaveBeenCalledWith('/api/custom_templates/template-123456/');
      expect(result).toEqual(mockCustomTemplateResultResponse);
    });
  });

  describe('getCustomTemplateList', () => {
    it('should fetch all custom template tasks', async () => {
      const mockTemplateList = [
        mockCustomTemplateResultResponse,
        { ...mockCustomTemplateResultResponse, status: 'processing' },
      ];
      mockClient.get.mockResolvedValueOnce(mockTemplateList);

      const result = await customTemplatesApi.getCustomTemplateList();

      expect(mockClient.get).toHaveBeenCalledWith('/api/custom_templates/');
      expect(result).toEqual(mockTemplateList);
    });
  });

  describe('createAndWaitForCustomTemplate', () => {
    it('should create a custom template task and wait for completion', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockCustomTemplateResponse);
      mockClient.get.mockResolvedValueOnce(mockCustomTemplateResultResponse); // Return done immediately to avoid timeout

      // Mock timers
      vi.useFakeTimers();

      const params = {
        visual_style: 'modern-professional',
        data: {
          name: 'John Doe',
          company: 'Acme Inc.',
        },
      };

      // Start the async process with a short polling interval
      const resultPromise = customTemplatesApi.createAndWaitForCustomTemplate(params, 100);

      // Fast forward timers to simulate waiting
      vi.advanceTimersByTime(100);

      // Await the final result
      const result = await resultPromise;

      // Restore timers
      vi.useRealTimers();

      // Verify the method calls
      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith('/api/custom_templates/', params);

      expect(mockClient.get).toHaveBeenCalledWith('/api/custom_templates/template-123/');

      // Final result should be the completed custom template task
      expect(result).toEqual(mockCustomTemplateResultResponse);
    }, 10000); // Increase timeout

    it('should handle error responses', async () => {
      // Mock the post and get methods to return an error response
      mockClient.post.mockResolvedValueOnce(mockCustomTemplateResponse);
      mockClient.get.mockResolvedValueOnce({
        ...mockCustomTemplateResultResponse,
        status: 'error',
        success: false,
        error_message: 'Something went wrong',
      });

      const params = {
        visual_style: 'modern-professional',
        data: {
          name: 'John Doe',
          company: 'Acme Inc.',
        },
      };

      // Start the async process with a short polling interval
      const result = await customTemplatesApi.createAndWaitForCustomTemplate(params, 100);

      // Final result should be the error response
      expect(result).toEqual({
        ...mockCustomTemplateResultResponse,
        status: 'error',
        success: false,
        error_message: 'Something went wrong',
      });
    }, 10000); // Increase timeout

    it('should throw an error if max attempts is reached', async () => {
      // Mock the post and get methods to always return pending status
      mockClient.post.mockResolvedValueOnce(mockCustomTemplateResponse);
      mockClient.get.mockResolvedValue({ ...mockCustomTemplateResultResponse, status: 'pending' });

      const params = {
        visual_style: 'modern-professional',
        data: {
          name: 'John Doe',
          company: 'Acme Inc.',
        },
      };

      // Start the async process with only 2 max attempts and a short polling interval
      const resultPromise = customTemplatesApi.createAndWaitForCustomTemplate(params, 100, 2);

      // Expect the function to throw an error due to timeout
      await expect(resultPromise).rejects.toThrow(/did not complete within the timeout period/);
    }, 10000); // Increase timeout
  });
});
