import { CreatifyApiClient } from './client';
import { apiClientFactory } from './client-factory';
import {
  AvatarApi,
  UrlToVideoApi,
  TextToSpeechApi,
  AiEditingApi,
  CustomTemplatesApi,
  DyoaApi,
  AiShortsApi,
  AiScriptsApi,
  MusicsApi,
  WorkspaceApi,
  LipsyncV2Api,
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
   * AI Shorts API module
   */
  public aiShorts: AiShortsApi;

  /**
   * AI Scripts API module
   */
  public aiScripts: AiScriptsApi;

  /**
   * Musics API module
   */
  public musics: MusicsApi;

  /**
   * Workspace API module
   */
  public workspace: WorkspaceApi;

  /**
   * Lipsync v2 API module
   */
  public lipsyncV2: LipsyncV2Api;

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
    this.aiShorts = new AiShortsApi(options, apiClientFactory);
    this.aiScripts = new AiScriptsApi(options, apiClientFactory);
    this.musics = new MusicsApi(options, apiClientFactory);
    this.workspace = new WorkspaceApi(options, apiClientFactory);
    this.lipsyncV2 = new LipsyncV2Api(options, apiClientFactory);
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
  DyoaApi,
  AiShortsApi,
  AiScriptsApi,
  MusicsApi,
  WorkspaceApi,
  LipsyncV2Api,
};

// Export client factory
export { apiClientFactory, CreatifyApiClientFactory } from './client-factory';

// Export utility classes
export { utils };
