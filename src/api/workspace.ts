import { CreatifyApiOptions } from '../types';
import { Workspace } from '../types';
import { ICreatifyApiClient } from '../types/api-client';
import { apiClientFactory } from '../client-factory';

/**
 * Client for interacting with the Creatify Workspace API
 * @see https://creatify.mintlify.app/api-reference/workspace
 */
export class WorkspaceApi {
  private client: ICreatifyApiClient;

  /**
   * Create a new WorkspaceApi instance
   * @param options API client options
   * @param clientFactory Optional factory for creating API clients (useful for testing)
   */
  constructor(
    options: CreatifyApiOptions,
    clientFactory = apiClientFactory
  ) {
    this.client = clientFactory.createClient(options);
  }

  /**
   * Get the remaining credits for the current workspace
   * @returns Promise resolving to the remaining credits
   * @see https://creatify.mintlify.app/api-reference/workspace/get-remainingcredits
   */
  async getRemainingCredits(): Promise<Workspace.RemainingCreditsResponse> {
    try {
      return await this.client.get<Workspace.RemainingCreditsResponse>('/api/remaining_credits/');
    } catch (error) {
      console.error('Error fetching remaining credits:', error);
      // Return a default response to prevent crashes
      return {
        remaining_credits: 0
      };
    }
  }
}
