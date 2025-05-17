import { CreatifyApiClient } from './client';
import { AvatarApi, UrlToVideoApi } from './api';
import * as Types from './types';

/**
 * Main Creatify API client with all API modules
 */
export class Creatify {
  /**
   * Client options
   */
  private options: Types.CreatifyApiOptions;

  /**
   * Avatar API module
   */
  public avatar: AvatarApi;

  /**
   * URL-to-Video API module
   */
  public urlToVideo: UrlToVideoApi;

  /**
   * Create a new Creatify API client with all available API modules
   * @param options Configuration options for the API client
   */
  constructor(options: Types.CreatifyApiOptions) {
    this.options = options;
    this.avatar = new AvatarApi(options);
    this.urlToVideo = new UrlToVideoApi(options);
  }
}

// Export types
export { Types };

// Export individual API classes
export { CreatifyApiClient, AvatarApi, UrlToVideoApi };