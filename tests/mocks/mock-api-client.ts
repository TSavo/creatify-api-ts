import { vi } from 'vitest';
import { CreatifyApiOptions } from '../../src/types';
import { ICreatifyApiClient, ICreatifyApiClientFactory } from '../../src/types/api-client';

/**
 * Mock implementation of the Creatify API client for testing
 */
export class MockCreatifyApiClient implements ICreatifyApiClient {
  public get = vi.fn();
  public post = vi.fn();
  public put = vi.fn();
  public delete = vi.fn();

  constructor(private options: CreatifyApiOptions) {}

  /**
   * Reset all mocks
   */
  reset() {
    this.get.mockReset();
    this.post.mockReset();
    this.put.mockReset();
    this.delete.mockReset();
  }

  /**
   * Configure mock to return specific data for all methods
   * @param data The data to return
   */
  mockAllMethodsToReturn(data: any) {
    this.get.mockResolvedValue(data);
    this.post.mockResolvedValue(data);
    this.put.mockResolvedValue(data);
    this.delete.mockResolvedValue(data);
  }

  /**
   * Configure mock to throw an error for all methods
   * @param error The error to throw
   */
  mockAllMethodsToThrow(error: any) {
    this.get.mockRejectedValue(error);
    this.post.mockRejectedValue(error);
    this.put.mockRejectedValue(error);
    this.delete.mockRejectedValue(error);
  }
}

/**
 * Mock factory for creating Creatify API clients
 */
export class MockCreatifyApiClientFactory implements ICreatifyApiClientFactory {
  private mockClient: MockCreatifyApiClient | null = null;

  /**
   * Create a new mock API client instance
   * @param options Configuration options
   * @returns Mock API client instance
   */
  createClient(options: CreatifyApiOptions): ICreatifyApiClient {
    this.mockClient = new MockCreatifyApiClient(options);
    return this.mockClient;
  }

  /**
   * Get the last created mock client
   * @returns The mock client or null if none has been created
   */
  getLastCreatedClient(): MockCreatifyApiClient | null {
    return this.mockClient;
  }
}

// Default mock factory instance for convenient import
export const mockApiClientFactory = new MockCreatifyApiClientFactory();
