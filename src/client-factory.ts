import { CreatifyApiClient } from './client';
import { CreatifyApiOptions } from './types';
import { ICreatifyApiClient, ICreatifyApiClientFactory } from './types/api-client';

/**
 * Factory for creating Creatify API clients
 */
export class CreatifyApiClientFactory implements ICreatifyApiClientFactory {
  /**
   * Create a new API client instance
   * @param options Configuration options
   * @returns API client instance
   */
  createClient(options: CreatifyApiOptions): ICreatifyApiClient {
    return new CreatifyApiClient(options);
  }
}

// Default factory instance for convenient import
export const apiClientFactory = new CreatifyApiClientFactory();
