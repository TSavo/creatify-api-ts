/**
 * Avatar API types
 */

/**
 * Avatar information as returned by the /api/personas/ endpoint
 * @see https://creatify.mintlify.app/api-reference/personas/get-apipersonas
 */
export interface AvatarInfo {
  /**
   * Unique identifier for the avatar
   */
  id: string;

  /**
   * Alias for id - used in MultiAvatarLipsyncParams and other API interactions
   */
  avatar_id?: string;

  /**
   * Display name for the avatar
   */
  name?: string;

  /**
   * Creation timestamp
   */
  created_at: string;

  /**
   * Last update timestamp
   */
  updated_at: string;

  /**
   * Gender of the avatar (m = male, f = female, nb = non binary)
   */
  gender: 'm' | 'f' | 'nb';

  /**
   * Age range of the avatar (child, teen, adult, senior)
   */
  age_range: 'child' | 'teen' | 'adult' | 'senior';

  /**
   * Location type (outdoor, fantasy, indoor, other)
   */
  location: 'outdoor' | 'fantasy' | 'indoor' | 'other';

  /**
   * Style (selfie, presenter, other)
   */
  style: 'selfie' | 'presenter' | 'other';

  /**
   * Name of the creator
   */
  creator_name: string;

  /**
   * Video scene description
   */
  video_scene: string;

  /**
   * Keywords associated with the avatar
   */
  keywords: string[];

  /**
   * URL to the avatar's thumbnail image
   */
  thumbnail_url: string;

  /**
   * URL to the avatar's preview video
   */
  preview_url: string;

  /**
   * Whether the avatar is a default avatar
   */
  is_default: boolean;

  /**
   * Whether the avatar is a custom avatar
   */
  is_custom: boolean;

  /**
   * Whether the avatar is a premium avatar
   */
  is_premium: boolean;

  /**
   * Whether the avatar is a public avatar
   */
  is_public: boolean;

  /**
   * Whether the avatar is a private avatar
   */
  is_private: boolean;

  /**
   * Whether the avatar is a featured avatar
   */
  is_featured: boolean;

  /**
   * Whether the avatar is a trending avatar
   */
  is_trending: boolean;

  /**
   * Whether the avatar is a new avatar
   */
  is_new: boolean;

  /**
   * Whether the avatar is a popular avatar
   */
  is_popular: boolean;

  /**
   * Whether the avatar is a recommended avatar
   */
  is_recommended: boolean;

  /**
   * Whether the avatar is a verified avatar
   */
  is_verified: boolean;

  /**
   * Whether the avatar is a sponsored avatar
   */
  is_sponsored: boolean;

  /**
   * Whether the avatar is a partner avatar
   */
  is_partner: boolean;

  /**
   * Whether the avatar is a staff avatar
   */
  is_staff: boolean;

  /**
   * Whether the avatar is a team avatar
   */
  is_team: boolean;

  /**
   * Whether the avatar is a bot avatar
   */
  is_bot: boolean;

  /**
   * Whether the avatar is a system avatar
   */
  is_system: boolean;

  /**
   * Whether the avatar is an official avatar
   */
  is_official: boolean;

  /**
   * Whether the avatar is a verified partner avatar
   */
  is_verified_partner: boolean;

  /**
   * Whether the avatar is a verified creator avatar
   */
  is_verified_creator: boolean;

  /**
   * Whether the avatar is a verified staff avatar
   */
  is_verified_staff: boolean;

  /**
   * Whether the avatar is a verified team avatar
   */
  is_verified_team: boolean;

  /**
   * Whether the avatar is a verified bot avatar
   */
  is_verified_bot: boolean;

  /**
   * Whether the avatar is a verified system avatar
   */
  is_verified_system: boolean;

  /**
   * Whether the avatar is a verified official avatar
   */
  is_verified_official: boolean;
}

/**
 * Parameters for creating a lipsync task with a single avatar
 * @see https://creatify.mintlify.app/api-reference/lipsyncs/post-apilipsyncs
 */
export interface SingleAvatarLipsyncParams {
  /**
   * Avatar ID to use for the lipsync
   */
  avatar_id: string;

  /**
   * Avatar style to use (e.g., 'casual', 'professional')
   */
  avatar_style: string;

  /**
   * Text to convert to speech and lipsync
   */
  input_text: string;

  /**
   * Voice ID to use for text-to-speech
   */
  voice_id: string;

  /**
   * Background image URL
   */
  background_url: string;

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
 * Parameters for creating a lipsync task with multiple avatars
 * @see https://creatify.mintlify.app/api-reference/lipsyncs/post-apilipsyncs
 */
export interface MultiAvatarLipsyncParams {
  /**
   * Array of scenes, each with an avatar, voice, and background
   */
  scenes: {
    /**
     * Character configuration
     */
    character: {
      /**
       * Type of character (always 'avatar' for now)
       */
      type: 'avatar';

      /**
       * Avatar ID to use
       */
      avatar_id: string;

      /**
       * Avatar style to use
       */
      avatar_style: string;

      /**
       * Optional position offset
       */
      offset?: {
        /**
         * X-axis offset
         */
        x: number;

        /**
         * Y-axis offset
         */
        y: number;
      };
    };

    /**
     * Voice configuration
     */
    voice: {
      /**
       * Type of voice input (always 'text' for now)
       */
      type: 'text';

      /**
       * Text to convert to speech
       */
      input_text: string;

      /**
       * Voice ID to use
       */
      voice_id: string;
    };

    /**
     * Background configuration
     */
    background: {
      /**
       * Type of background (always 'image' for now)
       */
      type: 'image';

      /**
       * URL of the background image
       */
      url: string;
    };

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
  }[];

  /**
   * Optional aspect ratio for the video
   */
  aspect_ratio?: '16:9' | '9:16' | '1:1' | '4:5';
}

/**
 * Response from creating a lipsync task
 * @see https://creatify.mintlify.app/api-reference/lipsyncs/post-apilipsyncs
 */
export interface LipsyncResponse {
  /**
   * Task ID for the created lipsync task
   */
  task_id: string;
}

/**
 * Response from getting a lipsync task status
 * @see https://creatify.mintlify.app/api-reference/lipsyncs/get-apilipsyncstask_id
 */
export interface LipsyncStatusResponse {
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
