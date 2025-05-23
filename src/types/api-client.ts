import { CreatifyApiOptions } from './index';

/**
 * Interface for Creatify API HTTP client
 * This abstraction allows for easier mocking in tests without exposing axios implementation details
 */
export interface ICreatifyApiClient {
  /**
   * Make a GET request to the API
   * @param endpoint API endpoint to call
   * @param params Query parameters
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  get<T = any>(endpoint: string, params?: Record<string, any>, config?: any): Promise<T>;

  /**
   * Make a POST request to the API
   * @param endpoint API endpoint to call
   * @param data Request body data
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  post<T = any>(endpoint: string, data?: Record<string, any>, config?: any): Promise<T>;

  /**
   * Make a PUT request to the API
   * @param endpoint API endpoint to call
   * @param data Request body data
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  put<T = any>(endpoint: string, data?: Record<string, any>, config?: any): Promise<T>;

  /**
   * Make a DELETE request to the API
   * @param endpoint API endpoint to call
   * @param params Query parameters
   * @param config Additional request configuration
   * @returns Promise resolving to the response data
   */
  delete<T = any>(endpoint: string, params?: Record<string, any>, config?: any): Promise<T>;
}

/**
 * Factory for creating API clients
 */
export interface ICreatifyApiClientFactory {
  /**
   * Create a new API client instance
   * @param options Configuration options
   * @returns API client instance
   */
  createClient(options: CreatifyApiOptions): ICreatifyApiClient;
}
