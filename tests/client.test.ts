import { CreatifyApiClient } from '../src/client';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { mockErrorResponse } from './mocks/api-responses';
import { expect, describe, it, beforeEach, vi } from 'vitest';

// Mock fetch for testing
global.fetch = vi.fn();

// Create a mock Response
const mockJsonPromise = (data: any) => Promise.resolve(data);
const mockFetchPromise = (data: any, status = 200) => 
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => mockJsonPromise(data)
  } as Response);

describe('CreatifyApiClient', () => {
  let client: CreatifyApiClient;
  
  beforeEach(() => {
    client = new CreatifyApiClient({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    });
    
    // Clear mock history
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  });
  
  it('should initialize with API credentials', () => {
    expect(client).toBeDefined();
  });
  
  it('should set the base URL', () => {
    const defaultClient = new CreatifyApiClient({
      apiId: 'test-api-id',
      apiKey: 'test-api-key'
    });
    expect((defaultClient as any).baseUrl).toBe('https://api.creatify.ai');
    
    const customClient = new CreatifyApiClient({
      apiId: 'test-api-id',
      apiKey: 'test-api-key',
      baseUrl: 'https://custom-api.example.com'
    });
    expect((customClient as any).baseUrl).toBe('https://custom-api.example.com');
  });
  
  it('should make a GET request with auth headers', async () => {
    const mockData = { data: 'test' };
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockData));
    
    const response = await client.get('/test-endpoint');
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.creatify.ai/test-endpoint',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-ID': 'test-api-id',
          'X-API-KEY': 'test-api-key'
        }
      })
    );
    
    expect(response).toEqual(mockData);
  });
  
  it('should make a POST request with auth headers and body', async () => {
    const mockData = { success: true };
    const requestBody = { param1: 'value1', param2: 'value2' };
    
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockData));
    
    const response = await client.post('/test-endpoint', requestBody);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.creatify.ai/test-endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-ID': 'test-api-id',
          'X-API-KEY': 'test-api-key'
        },
        body: JSON.stringify(requestBody)
      })
    );
    
    expect(response).toEqual(mockData);
  });
  
  it('should make a PUT request with auth headers and body', async () => {
    const mockData = { success: true };
    const requestBody = { param1: 'value1', param2: 'value2' };
    
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockData));
    
    const response = await client.put('/test-endpoint', requestBody);
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.creatify.ai/test-endpoint',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-ID': 'test-api-id',
          'X-API-KEY': 'test-api-key'
        },
        body: JSON.stringify(requestBody)
      })
    );
    
    expect(response).toEqual(mockData);
  });
  
  it('should make a DELETE request with auth headers', async () => {
    const mockData = { success: true };
    
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockData));
    
    const response = await client.delete('/test-endpoint');
    
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.creatify.ai/test-endpoint',
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-ID': 'test-api-id',
          'X-API-KEY': 'test-api-key'
        }
      })
    );
    
    expect(response).toEqual(mockData);
  });
  
  it('should handle API errors with appropriate error message', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 
      mockFetchPromise(mockErrorResponse, 401)
    );
    
    await expect(client.get('/test-endpoint')).rejects.toThrow('Invalid API credentials');
  });
  
  it('should handle network errors', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    await expect(client.get('/test-endpoint')).rejects.toThrow('Network error');
  });
  
  it('should handle unexpected response format', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON'))
      } as Response)
    );
    
    await expect(client.get('/test-endpoint')).rejects.toThrow('Invalid JSON');
  });
  
  it('should respect the timeout option', async () => {
    const timeoutClient = new CreatifyApiClient({
      apiId: 'test-api-id',
      apiKey: 'test-api-key',
      timeout: 5000
    });
    
    const controller = new AbortController();
    vi.spyOn(AbortController.prototype, 'abort');
    
    const mockData = { data: 'test' };
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => mockFetchPromise(mockData));
    
    await timeoutClient.get('/test-endpoint');
    
    // Verify that the fetch was called with a signal
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.creatify.ai/test-endpoint',
      expect.objectContaining({
        signal: expect.any(AbortSignal)
      })
    );
    
    // Verify timeout was set
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });
});
