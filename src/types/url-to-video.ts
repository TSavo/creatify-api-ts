/**
 * URL-to-Video API types
 * @see https://creatify.mintlify.app/api-reference/link-to-video
 */

/**
 * Parameters for creating a link
 * @see https://creatify.mintlify.app/api-reference/link-to-video
 */
export interface LinkParams {
  /**
   * URL to convert to video
   */
  url: string;

  /**
   * Avatar ID to use
   */
  avatar_id: string;

  /**
   * Avatar style to use
   */
  avatar_style: string;

  /**
   * Voice ID to use
   */
  voice_id: string;

  /**
   * Optional aspect ratio for the video
   */
  aspect_ratio?: '16:9' | '9:16' | '1:1' | '4:5';

  /**
   * Optional caption settings
   */
  caption_setting?: {
    /**
     * Whether to enable captions
     */
    enable: boolean;

    /**
     * Caption position ('top', 'bottom')
     */
    position: 'top' | 'bottom';

    /**
     * Caption text color (hex code)
     */
    text_color: string;

    /**
     * Caption background color (hex code)
     */
    bg_color: string;

    /**
     * Caption font size
     */
    font_size: number;
  };
}

/**
 * Response from creating a link-to-video task
 * @see https://creatify.mintlify.app/api-reference/link-to-video/post-link-to-video
 */
export interface LinkResponse {
  /**
   * Task ID for the created link-to-video task
   */
  task_id: string;
}

/**
 * Response from getting a link-to-video task status
 * @see https://creatify.mintlify.app/api-reference/link-to-video/get-link-to-videotask_id
 */
export interface LinkStatusResponse {
  /**
   * Task ID
   */
  task_id: string;

  /**
   * Status of the task
   */
  status: 'pending' | 'processing' | 'failed' | 'done' | 'error';

  /**
   * URL to the generated video (only present when status is 'done')
   */
  video_url?: string;

  /**
   * Error message (only present when status is 'error')
   */
  error?: string;

  /**
   * Creation timestamp
   */
  created_at: string;

  /**
   * Last update timestamp
   */
  updated_at: string;
}
