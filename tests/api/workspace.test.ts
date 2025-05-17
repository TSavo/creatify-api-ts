import { WorkspaceApi } from '../../src/api/workspace';
import {
  mockRemainingCreditsResponse
} from '../mocks/api-responses';
import { mockApiClientFactory, MockCreatifyApiClient } from '../mocks/mock-api-client';
import { describe, it, expect, beforeEach } from 'vitest';

describe('WorkspaceApi', () => {
  let workspaceApi: WorkspaceApi;
  let mockClient: MockCreatifyApiClient;

  beforeEach(() => {
    // Create a new instance of the WorkspaceApi with the mock factory
    workspaceApi = new WorkspaceApi({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    }, mockApiClientFactory);

    // Get the mock client that was created
    mockClient = mockApiClientFactory.getLastCreatedClient() as MockCreatifyApiClient;

    // Reset mock history
    mockClient.reset();
  });

  describe('getRemainingCredits', () => {
    it('should fetch remaining credits', async () => {
      // Mock the get method to return the expected response
      mockClient.get.mockResolvedValueOnce(mockRemainingCreditsResponse);

      const result = await workspaceApi.getRemainingCredits();

      expect(mockClient.get).toHaveBeenCalledWith('/api/remaining_credits/');
      expect(result).toEqual(mockRemainingCreditsResponse);
    });

    it('should handle errors gracefully', async () => {
      // Mock the get method to throw an error
      mockClient.get.mockRejectedValueOnce(new Error('API error'));

      const result = await workspaceApi.getRemainingCredits();

      expect(mockClient.get).toHaveBeenCalledWith('/api/remaining_credits/');
      expect(result).toEqual({ remaining_credits: 0 });
    });
  });
});
