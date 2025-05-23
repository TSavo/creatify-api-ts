import { CreatifyApiOptions } from '../types';
import { UrlToVideo } from '../types';
import { ICreatifyApiClient } from '../types/api-client';
import { apiClientFactory } from '../client-factory';

/**
 * Client for interacting with the Creatify URL-to-Video API
 * @see https://creatify.mintlify.app/api-reference/link-to-video
 */
export class UrlToVideoApi {
  private client: ICreatifyApiClient;

  /**
   * Create a new UrlToVideoApi instance
   * @param options API client options
   * @param clientFactory Optional factory for creating API clients (useful for testing)
   */
  constructor(options: CreatifyApiOptions, clientFactory = apiClientFactory) {
    this.client = clientFactory.createClient(options);
  }
  /**
   * Create a link from a URL
   * @param params Parameters containing the URL
   * @returns Promise resolving to the link response
   * @see https://creatify.mintlify.app/api-reference/links/post-apilinks
   */
  async createLink(params: UrlToVideo.LinkParams): Promise<UrlToVideo.LinkResponse> {
    return this.client.post<UrlToVideo.LinkResponse>('/api/links/', params);
  }

  /**
   * Create a link with custom parameters
   * @param params Custom link parameters
   * @returns Promise resolving to the link response
   * @see https://creatify.mintlify.app/api-reference/links/post-apilink_with_params
   */
  async createLinkWithParams(
    params: UrlToVideo.CustomLinkParams
  ): Promise<UrlToVideo.LinkResponse> {
    return this.client.post<UrlToVideo.LinkResponse>('/api/links/link_with_params/', params);
  }

  /**
   * Update an existing link
   * @param id ID of the link to update
   * @param params New link parameters
   * @returns Promise resolving to the updated link data
   * @see https://creatify.mintlify.app/api-reference/links/put-apilinks-
   */
  async updateLink(
    id: string,
    params: Partial<UrlToVideo.CustomLinkParams> & { url?: string }
  ): Promise<UrlToVideo.LinkData> {
    return this.client.put<UrlToVideo.LinkData>(`/api/links/${id}/`, params);
  }

  /**
   * Get an existing link by ID
   * @param id ID of the link to get
   * @returns Promise resolving to the link data
   * @see https://creatify.mintlify.app/api-reference/links/get-apilinks-
   */
  async getLink(id: string): Promise<UrlToVideo.LinkData> {
    return this.client.get<UrlToVideo.LinkData>(`/api/links/${id}/`);
  }

  /**
   * Get all existing links
   * @param page Page number (starts from 1)
   * @param limit Number of items per page
   * @returns Promise resolving to an array of link data
   * @see https://creatify.mintlify.app/api-reference/links/get-apilinks
   */
  async getLinks(page?: number, limit?: number): Promise<UrlToVideo.LinkData[]> {
    return this.client.get<UrlToVideo.LinkData[]>('/api/links/', { page, limit });
  }

  /**
   * Get paginated list of links
   * @param page Page number (starts from 1)
   * @param limit Number of items per page
   * @returns Promise resolving to paginated link data
   * @see https://creatify.mintlify.app/api-reference/links/get-apilinks-paginated
   */
  async getLinksPaginated(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: UrlToVideo.LinkData[];
  }> {
    return this.client.get('/api/links/paginated/', { page, limit });
  }

  /**
   * Create a video from a link
   * @param params Parameters for video generation
   * @returns Promise resolving to the video response
   * @see https://creatify.mintlify.app/api-reference/link-to-video
   */
  async createVideoFromLink(
    params: UrlToVideo.VideoFromLinkParams
  ): Promise<UrlToVideo.VideoResponse> {
    return this.client.post<UrlToVideo.VideoResponse>('/api/link_to_videos/', params);
  }

  /**
   * Get the status and result of a video generation task
   * @param id ID of the video task
   * @returns Promise resolving to the video status and result
   * @see https://creatify.mintlify.app/api-reference/link-to-video
   */
  async getVideo(id: string): Promise<UrlToVideo.VideoResultResponse> {
    return this.client.get<UrlToVideo.VideoResultResponse>(`/api/link_to_videos/${id}/`);
  }

  /**
   * Get all video generation tasks
   * @returns Promise resolving to an array of video tasks
   * @see https://creatify.mintlify.app/api-reference/link-to-video
   */
  async getVideos(): Promise<UrlToVideo.VideoResultResponse[]> {
    return this.client.get<UrlToVideo.VideoResultResponse[]>('/api/link_to_videos/');
  }
}
