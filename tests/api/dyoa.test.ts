import { DyoaApi } from '../../src/api/dyoa';
import {
  mockDyoaCreationResponse,
  mockDyoaWithPhotos,
  mockDyoaSubmittedForReview,
  mockDyoaApproved,
  mockDyoaList,
} from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DyoaApi', () => {
  let dyoaApi: DyoaApi;
  let mockClient: MockCreatifyApiClient;

  beforeEach(() => {
    // Create a new instance of the DyoaApi with the mock factory
    dyoaApi = new DyoaApi(
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

  describe('createDyoa', () => {
    it('should create a DYOA with avatar details', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockDyoaCreationResponse);

      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description:
          'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop',
      };

      const result = await dyoaApi.createDyoa(params);

      expect(mockClient.post).toHaveBeenCalledWith('/api/dyoa/', params);
      expect(result).toEqual(mockDyoaCreationResponse);
    });
  });

  describe('getDyoa', () => {
    it('should fetch a DYOA by ID', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockDyoaWithPhotos);

      const result = await dyoaApi.getDyoa('dyoa-123456');

      expect(mockClient.get).toHaveBeenCalledWith('/api/dyoa/dyoa-123456/');
      expect(result).toEqual(mockDyoaWithPhotos);
    });
  });

  describe('getDyoaList', () => {
    it('should fetch all DYOAs', async () => {
      mockClient.get.mockResolvedValueOnce(mockDyoaList);

      const result = await dyoaApi.getDyoaList();

      expect(mockClient.get).toHaveBeenCalledWith('/api/dyoa/');
      expect(result).toEqual(mockDyoaList);
    });
  });

  describe('submitDyoaForReview', () => {
    it('should submit a DYOA for review with the chosen photo', async () => {
      // Mock the post method to return the expected response
      mockClient.post.mockResolvedValueOnce(mockDyoaSubmittedForReview);

      const params = {
        chosen_photo_id: 'photo-1',
      };

      const result = await dyoaApi.submitDyoaForReview('dyoa-123456', params);

      expect(mockClient.post).toHaveBeenCalledWith(
        '/api/dyoa/dyoa-123456/submit_for_review/',
        params
      );
      expect(result).toEqual(mockDyoaSubmittedForReview);
    });
  });

  describe('deleteDyoa', () => {
    it('should delete a DYOA', async () => {
      // Mock the delete method to return the expected response
      mockClient.delete.mockResolvedValueOnce(undefined);

      await dyoaApi.deleteDyoa('dyoa-123456');

      expect(mockClient.delete).toHaveBeenCalledWith('/api/dyoa/dyoa-123456/');
    });
  });

  describe('createAndWaitForDyoaPhotos', () => {
    it('should create a DYOA and wait for photos to be generated', async () => {
      // Mock the post and get methods to return the expected responses in sequence
      mockClient.post.mockResolvedValueOnce(mockDyoaCreationResponse);
      mockClient.get.mockResolvedValueOnce(mockDyoaWithPhotos); // Return photos immediately to avoid timeout

      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description:
          'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop',
      };

      // Start the async process with a short polling interval
      const result = await dyoaApi.createAndWaitForDyoaPhotos(params, 100);

      // Verify the method calls
      expect(mockClient.post).toHaveBeenCalledWith('/api/dyoa/', params);
      expect(mockClient.get).toHaveBeenCalledWith('/api/dyoa/dyoa-123456/');

      // Final result should be the DYOA with photos
      expect(result).toEqual(mockDyoaWithPhotos);
    }, 10000); // Increase timeout

    it('should throw an error if max attempts is reached without photos', async () => {
      // Mock the post and get methods to always return DYOA without photos
      mockClient.post.mockResolvedValueOnce(mockDyoaCreationResponse);
      mockClient.get.mockResolvedValue({ ...mockDyoaCreationResponse, status: 'initializing' });

      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description:
          'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop',
      };

      // Create a function that will throw the expected error
      const dyoaPhotosWaitFn = async () => {
        // Use a very small number of attempts to make the test run faster
        return await dyoaApi.createAndWaitForDyoaPhotos(params, 100, 2);
      };

      // Expect the function to throw an error due to timeout
      await expect(dyoaPhotosWaitFn()).rejects.toThrow(
        /photos were not generated within the timeout period/
      );
    }, 10000); // Increase timeout
  });

  describe('createSubmitAndWaitForDyoa', () => {
    it('should create a DYOA, wait for photos, submit for review and wait for approval', async () => {
      // Mock the methods for the create, photo generation, submission, and review sequence
      mockClient.post
        .mockResolvedValueOnce(mockDyoaCreationResponse) // createDyoa
        .mockResolvedValueOnce(mockDyoaSubmittedForReview); // submitDyoaForReview

      mockClient.get
        .mockResolvedValueOnce(mockDyoaWithPhotos) // First getDyoa after create
        .mockResolvedValueOnce(mockDyoaApproved); // Return approved immediately to avoid timeout

      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description:
          'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop',
      };

      // Start the async process with short polling intervals
      const result = await dyoaApi.createSubmitAndWaitForDyoa(
        params,
        0, // Use first photo
        100, // Photo gen poll interval
        3, // Photo gen max attempts
        100, // Review poll interval
        3 // Review max attempts
      );

      // Verify the method calls
      expect(mockClient.post).toHaveBeenCalledTimes(2);
      expect(mockClient.get).toHaveBeenCalledTimes(2);

      // Final result should be the approved DYOA
      expect(result).toEqual(mockDyoaApproved);
    }, 10000); // Increase timeout

    it('should throw an error if no photos are generated', async () => {
      // Mock the post and get methods to return DYOA with no photos
      mockClient.post.mockResolvedValueOnce(mockDyoaCreationResponse);
      mockClient.get.mockResolvedValueOnce({
        ...mockDyoaCreationResponse,
        status: 'draft',
        photos: [],
      });

      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description:
          'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop',
      };

      // Create a function that will throw the expected error
      const dyoaNoPhotosWaitFn = async () => {
        // Use short polling intervals to make the test run faster
        return await dyoaApi.createSubmitAndWaitForDyoa(params, 0, 100, 1, 100, 1);
      };

      // Expect the function to throw an error due to no photos
      await expect(dyoaNoPhotosWaitFn()).rejects.toThrow();
    }, 10000); // Increase timeout

    it('should throw an error if review does not complete within timeout', async () => {
      // Mock methods with stuck pending review
      mockClient.post
        .mockResolvedValueOnce(mockDyoaCreationResponse)
        .mockResolvedValueOnce(mockDyoaSubmittedForReview);

      mockClient.get
        .mockResolvedValueOnce(mockDyoaWithPhotos)
        .mockResolvedValue(mockDyoaSubmittedForReview); // Always pending

      const params = {
        name: 'Tech Expert Avatar',
        age_group: 'adult' as any,
        gender: 'f' as any,
        more_details: 'Mid-length brown hair with subtle highlights, green eyes, warm smile',
        outfit_description:
          'Professional blazer in navy blue, simple white blouse, minimal jewelry',
        background_description: 'Modern tech office environment, clean desk with laptop',
      };

      // Create a function that will throw the expected error
      const dyoaReviewTimeoutFn = async () => {
        // Use short polling intervals and small max attempts to make the test run faster
        return await dyoaApi.createSubmitAndWaitForDyoa(
          params,
          0,
          100,
          1,
          100,
          2 // Only 2 review poll attempts
        );
      };

      // Expect the function to throw an error due to review timeout
      await expect(dyoaReviewTimeoutFn()).rejects.toThrow(
        /review did not complete within the timeout period/
      );
    }, 10000); // Increase timeout
  });
});
