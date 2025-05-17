import { CreatifyApiClient } from './client';
import { apiClientFactory } from './client-factory';
import {
  AvatarApi,
  UrlToVideoApi,
  TextToSpeechApi,
  AiEditingApi,
  CustomTemplatesApi,
  DyoaApi
} from './api';
import * as Types from './types';
import * as utils from './utils';

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
   * Text-to-Speech API module
   */
  public textToSpeech: TextToSpeechApi;

  /**
   * AI Editing API module
   */
  public aiEditing: AiEditingApi;

  /**
   * Custom Templates API module
   */
  public customTemplates: CustomTemplatesApi;

  /**
   * DYOA (Design Your Own Avatar) API module
   */
  public dyoa: DyoaApi;

  /**
   * Create a new Creatify API client with all available API modules
   * @param options Configuration options for the API client
   */
  constructor(options: Types.CreatifyApiOptions) {
    this.options = options;
    this.avatar = new AvatarApi(options, apiClientFactory);
    this.urlToVideo = new UrlToVideoApi(options, apiClientFactory);
    this.textToSpeech = new TextToSpeechApi(options, apiClientFactory);
    this.aiEditing = new AiEditingApi(options, apiClientFactory);
    this.customTemplates = new CustomTemplatesApi(options, apiClientFactory);
    this.dyoa = new DyoaApi(options, apiClientFactory);
  }
}

// Export types
export { Types };

// Export individual API classes
export {
  CreatifyApiClient,
  AvatarApi,
  UrlToVideoApi,
  TextToSpeechApi,
  AiEditingApi,
  CustomTemplatesApi,
  DyoaApi
};

// Export client factory
export { apiClientFactory, CreatifyApiClientFactory } from './client-factory';

// Export utility classes
export { utils };