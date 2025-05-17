import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CreatifyApiOptions } from './types';
import { ICreatifyApiClient } from './types/api-client';

/**
 * Base API client for Creatify API
 */
export class CreatifyApiClient implements ICreatifyApiClient {
  private client: AxiosInstance;
  private apiId: string;
  private apiKey: string;

  /**
   * Create a new Creatify API client
   * @param options Configuration options for the API client
   */
  constructor(options: CreatifyApiOptions) {
    this.apiId = options.apiId;
    this.apiKey = options.apiKey;

    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: options.baseUrl || 'https://api.creatify.ai',
      timeout: options.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-ID': this.apiId,
        'X-API-KEY': this.apiKey,
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Transform error object to a more user-friendly format
        if (error.response) {
          // Server responded with a status code outside of 2xx range
          const { status, data } = error.response;
          return Promise.reject({
            status,
            message: data.message || 'An error occurred with the API request',
            data: data,
          });
        } else if (error.request) {
          // Request was made but no response was received
          return Promise.reject({
            message: 'No response received from the API server',
            request: error.request,
          });
        } else {
          // Something else happened while setting up the request
          return Promise.reject({
            message: error.message || 'An error occurred while setting up the request',
          });
        }
      }
    );
  }

  /**
   * Make a GET request to the API
   * @param endpoint API endpoint to call
   * @param params Query parameters
   * @param config Additional axios config
   * @returns Promise resolving to the response data
   */
  public async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.get<T>(endpoint, {
      params,
      ...config,
    });
    return response.data;
  }

  /**
   * Make a POST request to the API
   * @param endpoint API endpoint to call
   * @param data Request body data
   * @param config Additional axios config
   * @returns Promise resolving to the response data
   */
  public async post<T = any>(
    endpoint: string,
    data?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a PUT request to the API
   * @param endpoint API endpoint to call
   * @param data Request body data
   * @param config Additional axios config
   * @returns Promise resolving to the response data
   */
  public async put<T = any>(
    endpoint: string,
    data?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(endpoint, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request to the API
   * @param endpoint API endpoint to call
   * @param params Query parameters
   * @param config Additional axios config
   * @returns Promise resolving to the response data
   */
  public async delete<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.delete<T>(endpoint, {
      params,
      ...config,
    });
    return response.data;
  }
}