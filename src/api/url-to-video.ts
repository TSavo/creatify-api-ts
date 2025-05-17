import { CreatifyApiClient } from '../client';
import { UrlToVideo } from '../types';

/**
 * Client for interacting with the Creatify URL-to-Video API
 */
export class UrlToVideoApi extends CreatifyApiClient {
  /**
   * Create a link from a URL
   * @param params Parameters containing the URL
   * @returns Promise resolving to the link response
   */
  async createLink(params: UrlToVideo.LinkParams): Promise<UrlToVideo.LinkResponse> {
    return this.post<UrlToVideo.LinkResponse>('/api/links/', params);
  }

  /**
   * Create a link with custom parameters
   * @param params Custom link parameters
   * @returns Promise resolving to the link response
   */
  async createLinkWithParams(
    params: UrlToVideo.CustomLinkParams
  ): Promise<UrlToVideo.LinkResponse> {
    return this.post<UrlToVideo.LinkResponse>('/api/links/link_with_params/', params);
  }

  /**
   * Update an existing link
   * @param id ID of the link to update
   * @param params New link parameters
   * @returns Promise resolving to the updated link data
   */
  async updateLink(
    id: string,
    params: Partial<UrlToVideo.CustomLinkParams> & { url?: string }
  ): Promise<UrlToVideo.LinkData> {
    return this.put<UrlToVideo.LinkData>(`/api/links/${id}/`, params);
  }

  /**
   * Get an existing link by ID
   * @param id ID of the link to get
   * @returns Promise resolving to the link data
   */
  async getLink(id: string): Promise<UrlToVideo.LinkData> {
    return this.get<UrlToVideo.LinkData>(`/api/links/${id}/`);
  }

  /**
   * Get all existing links
   * @returns Promise resolving to an array of link data
   */
  async getLinks(): Promise<UrlToVideo.LinkData[]> {
    return this.get<UrlToVideo.LinkData[]>('/api/links/');
  }

  /**
   * Create a video from a link
   * @param params Parameters for video generation
   * @returns Promise resolving to the video response
   */
  async createVideoFromLink(
    params: UrlToVideo.VideoFromLinkParams
  ): Promise<UrlToVideo.VideoResponse> {
    return this.post<UrlToVideo.VideoResponse>('/api/link_to_videos/', params);
  }

  /**
   * Get the status and result of a video generation task
   * @param id ID of the video task
   * @returns Promise resolving to the video status and result
   */
  async getVideo(id: string): Promise<UrlToVideo.VideoResultResponse> {
    return this.get<UrlToVideo.VideoResultResponse>(`/api/link_to_videos/${id}/`);
  }

  /**
   * Get all video generation tasks
   * @returns Promise resolving to an array of video tasks
   */
  async getVideos(): Promise<UrlToVideo.VideoResultResponse[]> {
    return this.get<UrlToVideo.VideoResultResponse[]>('/api/link_to_videos/');
  }
}