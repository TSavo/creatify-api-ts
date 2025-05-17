/**
 * Configuration options for the Creatify API client
 */
export interface CreatifyApiOptions {
  /**
   * The API ID from your Creatify account
   */
  apiId: string;
  
  /**
   * The API key from your Creatify account 
   */
  apiKey: string;
  
  /**
   * Base URL for the Creatify API (optional, defaults to https://api.creatify.ai)
   */
  baseUrl?: string;
  
  /**
   * Request timeout in milliseconds (optional, defaults to 30000)
   */
  timeout?: number;
}

/**
 * Base response interface for all API responses
 */
export interface ApiResponse {
  /**
   * Whether the request was successful
   */
  success: boolean;
  
  /**
   * Error message if the request failed
   */
  error?: string;
}

/**
 * Standard pagination parameters
 */
export interface PaginationParams {
  /**
   * Page number (starts from 1)
   */
  page?: number;
  
  /**
   * Number of items per page
   */
  limit?: number;
}

/**
 * Common aspect ratio options for video generation
 */
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

/**
 * Avatar API types
 */
export namespace Avatar {
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
    keywords: string;
    
    /**
     * Preview image URL for 16:9 aspect ratio
     */
    preview_image_16_9: string;
    
    /**
     * Preview image URL for 1:1 aspect ratio
     */
    preview_image_1_1: string;
    
    /**
     * Preview image URL for 9:16 aspect ratio
     */
    preview_image_9_16: string;
    
    /**
     * Preview video URL for 16:9 aspect ratio
     */
    preview_video_16_9: string;
    
    /**
     * Preview video URL for 1:1 aspect ratio
     */
    preview_video_1_1: string;
    
    /**
     * Preview video URL for 9:16 aspect ratio
     */
    preview_video_9_16: string;
    
    /**
     * Landscape preview video URL (legacy)
     */
    landscape_preview_video: string;
    
    /**
     * Squared preview video URL (legacy)
     */
    squared_preview_video: string;
    
    /**
     * Whether the avatar is active
     */
    is_active: boolean;
    
    /**
     * Processing status
     */
    process_status: string;
    
    /**
     * Reason for failure if any
     */
    failed_reason: string;
    
    /**
     * Avatar type
     */
    type: string;
  }

  /**
   * Voice information
   */
  export interface VoiceInfo {
    /**
     * Unique identifier for the voice
     */
    voice_id: string;
    
    /**
     * Name of the voice
     */
    name: string;
    
    /**
     * Language of the voice (e.g., "en", "fr")
     */
    language: string;
    
    /**
     * Gender of the voice (e.g., "male", "female")
     */
    gender: string;
  }

  /**
   * Parameters for creating a lipsync video
   * @see https://creatify.mintlify.app/api-reference/lipsyncs/post-apilipsyncs
   */
  export interface LipsyncParams {
    /**
     * Text to be spoken by the avatar
     */
    text: string;
    
    /**
     * Avatar ID to use for the video
     */
    creator: string;
    
    /**
     * Aspect ratio of the generated video
     * Available options: "1:1", "16:9", "9:16"
     */
    aspect_ratio?: AspectRatio;
    
    /**
     * Voice ID to use (optional)
     * If not provided, the system will use a default voice
     */
    voice_id?: string;
    
    /**
     * Background image URL (optional)
     * If provided, this image will be used as the background
     */
    background_url?: string;
    
    /**
     * Background color (optional)
     * CSS color value like "#FF0000" or "rgb(255,0,0)"
     */
    background_color?: string;
    
    /**
     * Output in transparent format (optional)
     * If true, the output video will have transparent background (for compositing)
     */
    transparent?: boolean;
    
    /**
     * Webhook URL to be called when the video is ready (optional)
     * The system will POST to this URL when processing is complete
     */
    webhook_url?: string;
    
    /**
     * Custom metadata for tracking (optional)
     * This data will be returned in webhook calls
     */
    metadata?: Record<string, any>;
  }

  /**
   * Response when creating a lipsync task
   */
  export interface LipsyncResponse extends ApiResponse {
    /**
     * ID of the created lipsync task
     */
    id: string;
    
    /**
     * Status of the lipsync task
     */
    status: 'pending' | 'processing' | 'done' | 'error';
  }

  /**
   * Response when getting a lipsync task
   */
  export interface LipsyncResultResponse extends LipsyncResponse {
    /**
     * Output URL of the generated video (only available when status is 'done')
     */
    output?: string;
    
    /**
     * Error message if the task failed
     */
    error_message?: string;
    
    /**
     * Created timestamp
     */
    created_at: string;
    
    /**
     * Updated timestamp
     */
    updated_at: string;
  }
  
  /**
   * Parameters for creating a multi-avatar lipsync video
   */
  export interface MultiAvatarLipsyncParams {
    /**
     * Array of video input configurations
     */
    video_inputs: {
      /**
       * Character configuration
       */
      character: {
        /**
         * Type of character (always "avatar" for now)
         */
        type: 'avatar';
        
        /**
         * Avatar ID to use
         */
        avatar_id: string;
        
        /**
         * Avatar style (e.g., "normal")
         */
        avatar_style: string;
        
        /**
         * Position offset of the avatar
         */
        offset?: {
          x: number;
          y: number;
        };
      };
      
      /**
       * Voice configuration
       */
      voice: {
        /**
         * Type of voice input (always "text" for now)
         */
        type: 'text';
        
        /**
         * Text to be spoken
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
         * Type of background (always "image" for now)
         */
        type: 'image';
        
        /**
         * URL of the background image
         */
        url: string;
      };
      
      /**
       * Caption settings
       */
      caption_setting?: {
        /**
         * Style of the caption
         */
        style: string;
        
        /**
         * Position offset of the caption
         */
        offset?: {
          x: number;
          y: number;
        };
      };
    }[];
    
    /**
     * Aspect ratio of the generated video
     */
    aspect_ratio: AspectRatio;
    
    /**
     * Webhook URL to be called when the video is ready (optional)
     */
    webhook_url?: string;
  }
}

/**
 * URL-to-Video API types
 * @see https://creatify.mintlify.app/api-reference/link-to-video
 */
export namespace UrlToVideo {
  /**
   * Parameters for creating a link
   * @see https://creatify.mintlify.app/api-reference/link-to-video
   */
  export interface LinkParams {
    /**
     * URL to extract content from
     */
    url: string;
  }

  /**
   * Response when creating a link
   */
  export interface LinkResponse {
    /**
     * Unique identifier for the link
     */
    id: string;
    
    /**
     * Original URL
     */
    url: string;
    
    /**
     * Link data object
     */
    link: LinkData;
  }

  /**
   * Parameters for creating a link with custom parameters
   */
  export interface CustomLinkParams {
    /**
     * Title of the content
     */
    title: string;
    
    /**
     * Description of the content
     */
    description: string;
    
    /**
     * URLs of images to use in the video
     */
    image_urls: string[];
    
    /**
     * URLs of videos to use (optional)
     */
    video_urls?: string[];
    
    /**
     * Customer reviews (optional)
     */
    reviews?: any;
    
    /**
     * URL of the logo (optional)
     */
    logo_url?: string;
  }

  /**
   * Link data returned by the API
   * @see https://creatify.mintlify.app/api-reference/link-to-video
   */
  export interface LinkData {
    /**
     * Unique identifier for the link
     */
    id: string;
    
    /**
     * Original URL
     */
    url: string;
    
    /**
     * Title extracted from the URL
     */
    title: string;
    
    /**
     * Description extracted from the URL
     */
    description: string;
    
    /**
     * URLs of images extracted from the URL
     */
    image_urls: string[];
    
    /**
     * URLs of videos extracted from the URL
     */
    video_urls: string[];
    
    /**
     * Reviews extracted from the URL (if any)
     */
    reviews?: any;
    
    /**
     * URL of the logo extracted from the URL
     */
    logo_url?: string;
  }

  /**
   * Parameters for creating a video from a link
   * @see https://creatify.mintlify.app/api-reference/link_to_videos/post-apilink_to_videos
   */
  export interface VideoFromLinkParams {
    /**
     * ID of the link to create a video from
     */
    link: string;
    
    /**
     * Optional name for the video
     */
    name?: string;
    
    /**
     * Target platform for the video (e.g., "Tiktok", "Instagram")
     */
    target_platform?: string;
    
    /**
     * Target audience description
     */
    target_audience?: string;
    
    /**
     * Language code for the video (e.g., "en", "es", "fr", "de", "ar")
     */
    language?: string;
    
    /**
     * Length of the video in seconds (default: 15)
     */
    video_length?: number;
    
    /**
     * Aspect ratio of the video (e.g., "16x9", "9x16", "1x1")
     */
    aspect_ratio?: string;
    
    /**
     * Script style to use for generating the video script
     */
    script_style?: string;
    
    /**
     * Visual style to use for generating the video
     */
    visual_style?: string;
    
    /**
     * Override the avatar with a specific avatar ID
     */
    override_avatar?: string;
    
    /**
     * Override the voice with a specific voice ID
     */
    override_voice?: string;
    
    /**
     * Override the auto-generated script with a custom script
     */
    override_script?: string;
    
    /**
     * URL to a background music track
     */
    background_music_url?: string;
    
    /**
     * Volume level for background music (0.0 - 1.0)
     */
    background_music_volume?: number;
    
    /**
     * Volume level for voiceover (0.0 - 1.0)
     */
    voiceover_volume?: number;
    
    /**
     * Webhook URL to be called when the video is ready
     */
    webhook_url?: string;
    
    /**
     * Disable background music if true
     */
    no_background_music?: boolean;
    
    /**
     * Disable captions if true
     */
    no_caption?: boolean;
    
    /**
     * Disable emotional expressions if true
     */
    no_emotion?: boolean;
    
    /**
     * Disable call-to-action if true
     */
    no_cta?: boolean;
    
    /**
     * Disable stock b-roll footage if true
     */
    no_stock_broll?: boolean;
    
    /**
     * Caption style (e.g., "normal-black")
     */
    caption_style?: string;
    
    /**
     * Caption horizontal offset
     */
    caption_offset_x?: string | number;
    
    /**
     * Caption vertical offset
     */
    caption_offset_y?: string | number;
    
    /**
     * Detailed caption settings
     */
    caption_setting?: {
      /**
       * Caption style
       */
      style?: string;
      
      /**
       * Caption position offset
       */
      offset?: {
        x: number;
        y: number;
      };
      
      /**
       * Font family
       */
      font_family?: string;
      
      /**
       * Font size
       */
      font_size?: number;
      
      /**
       * Font style
       */
      font_style?: string;
      
      /**
       * Background color
       */
      background_color?: string;
      
      /**
       * Text color
       */
      text_color?: string;
      
      /**
       * Highlight text color
       */
      highlight_text_color?: string;
      
      /**
       * Maximum width
       */
      max_width?: number;
      
      /**
       * Line height
       */
      line_height?: number;
      
      /**
       * Text shadow
       */
      text_shadow?: string;
      
      /**
       * Hide captions if true
       */
      hidden?: boolean;
    };
  }
  
  /**
   * Response when creating a video from a link
   * @see https://creatify.mintlify.app/api-reference/link_to_videos/post-apilink_to_videos
   */
  export interface VideoResponse {
    /**
     * ID of the created video task
     */
    id: string;
    
    /**
     * Status of the video task
     */
    status: 'pending' | 'in_queue' | 'running' | 'failed' | 'done';
    
    /**
     * Link ID used to create the video
     */
    link: string;
    
    /**
     * Media job ID
     */
    media_job: string;
    
    /**
     * Reason for failure if the task failed
     */
    failed_reason?: string;
    
    /**
     * Other parameters match the input parameters
     */
    [key: string]: any;
  }
  
  /**
   * Response when getting a video result
   * @see https://creatify.mintlify.app/api-reference/link_to_videos/get-apilink_to_videos-
   */
  export interface VideoResultResponse extends VideoResponse {
    /**
     * URL of the generated video (only available when status is 'done')
     */
    video_output?: string;
    
    /**
     * URL of the video thumbnail
     */
    video_thumbnail?: string;
    
    /**
     * Number of credits used for this video
     */
    credits_used?: number;
    
    /**
     * Progress indication (e.g., percentage)
     */
    progress?: string;
    
    /**
     * Created timestamp
     */
    created_at?: string;
    
    /**
     * Updated timestamp
     */
    updated_at?: string;
  }
}

/**
 * Text to Speech API types
 * @see https://creatify.mintlify.app/api-reference/text-to-speech
 */
export namespace TextToSpeech {
  /**
   * Parameters for creating a text-to-speech task
   * @see https://creatify.mintlify.app/api-reference/text-to-speech/post-text-to-speech
   */
  export interface TextToSpeechParams {
    /**
     * Text script to be converted to speech
     */
    script: string;
    
    /**
     * Accent/voice ID to use for the speech
     * You can get the accent id by calling the Get voices endpoint
     */
    accent: string;
    
    /**
     * Webhook URL to be called when the audio is ready (optional)
     * The system will POST to this URL when processing is complete
     */
    webhook_url?: string;
  }

  /**
   * Response when creating a text-to-speech task
   */
  export interface TextToSpeechResponse {
    /**
     * ID of the created text-to-speech task
     */
    id: string;
    
    /**
     * Status of the text-to-speech task
     */
    status: 'pending' | 'in_queue' | 'running' | 'failed' | 'done' | 'error';
    
    /**
     * The script that was submitted
     */
    script: string;
    
    /**
     * The accent/voice ID that was used
     */
    accent: string;
    
    /**
     * The webhook URL that was provided (if any)
     */
    webhook_url?: string;
    
    /**
     * Media job ID
     */
    media_job?: string;
    
    /**
     * Whether the TTS task is hidden
     */
    is_hidden?: boolean;
    
    /**
     * Reason for failure if the task failed
     */
    failed_reason?: string;
  }

  /**
   * Response when getting a text-to-speech task
   * @see https://creatify.mintlify.app/api-reference/text-to-speech/get-text-to-speech-
   */
  export interface TextToSpeechResultResponse extends TextToSpeechResponse {
    /**
     * Output URL of the generated audio (only available when status is 'done')
     */
    output?: string;
    
    /**
     * Created timestamp
     */
    created_at: string;
    
    /**
     * Updated timestamp
     */
    updated_at: string;
  }
}

/**
 * AI Editing API types
 */
export namespace AiEditing {
  /**
   * Editing styles available for AI editing
   */
  export type EditingStyle = 
    'film' | 
    'commercial' | 
    'music' | 
    'tutorial' | 
    'vlog' | 
    'social';

  /**
   * Parameters for creating an AI editing task
   */
  export interface AiEditingParams {
    /**
     * URL of the video to be edited
     */
    video_url: string;
    
    /**
     * Editing style to apply
     */
    editing_style: EditingStyle;
    
    /**
     * Webhook URL to be called when the edited video is ready (optional)
     */
    webhook_url?: string;
  }

  /**
   * Response when creating an AI editing task
   */
  export interface AiEditingResponse extends ApiResponse {
    /**
     * ID of the created AI editing task
     */
    id: string;
    
    /**
     * Status of the AI editing task
     */
    status: 'pending' | 'processing' | 'done' | 'error';
  }

  /**
   * Response when getting an AI editing task
   */
  export interface AiEditingResultResponse extends AiEditingResponse {
    /**
     * Output URL of the edited video (only available when status is 'done')
     */
    output?: string;
    
    /**
     * Error message if the task failed
     */
    error_message?: string;
    
    /**
     * Created timestamp
     */
    created_at: string;
    
    /**
     * Updated timestamp
     */
    updated_at: string;
  }
}

/**
 * Custom Templates API types
 */
export namespace CustomTemplates {
  /**
   * Parameters for creating a video using a custom template
   */
  export interface CustomTemplateParams {
    /**
     * Visual style/template name to use
     */
    visual_style: string;
    
    /**
     * Custom data to populate the template
     */
    data: Record<string, any>;
    
    /**
     * Webhook URL to be called when the video is ready (optional)
     */
    webhook_url?: string;
  }

  /**
   * Response when creating a custom template video
   */
  export interface CustomTemplateResponse extends ApiResponse {
    /**
     * ID of the created custom template task
     */
    id: string;
    
    /**
     * Status of the custom template task
     */
    status: 'pending' | 'processing' | 'done' | 'error';
  }

  /**
   * Response when getting a custom template task
   */
  export interface CustomTemplateResultResponse extends CustomTemplateResponse {
    /**
     * Output URL of the generated video (only available when status is 'done')
     */
    output?: string;
    
    /**
     * Error message if the task failed
     */
    error_message?: string;
    
    /**
     * Created timestamp
     */
    created_at: string;
    
    /**
     * Updated timestamp
     */
    updated_at: string;
  }
}

/**
 * DYOA (Design Your Own Avatar) API types
 */
export namespace DYOA {
  /**
   * Age group options for DYOA
   */
  export type AgeGroup = 
    'young_adult' | 
    'adult' | 
    'middle_aged' | 
    'senior';

  /**
   * Gender options for DYOA
   */
  export type Gender = 
    'm' | 
    'f' | 
    'other';

  /**
   * Status options for DYOA
   */
  export type DyoaStatus = 
    'initializing' | 
    'draft' | 
    'pending' | 
    'approved' | 
    'rejected' | 
    'done' | 
    'error';

  /**
   * Status options for DYOA review
   */
  export type DyoaReviewStatus = 
    'pending' | 
    'approved' | 
    'rejected';

  /**
   * Photo information for DYOA
   */
  export interface DyoaPhoto {
    /**
     * Unique identifier for the photo
     */
    id: string;
    
    /**
     * URL to the photo image
     */
    image: string;
    
    /**
     * Creation timestamp
     */
    created_at: string;
  }

  /**
   * Review information for DYOA
   */
  export interface DyoaReview {
    /**
     * Unique identifier for the review
     */
    id: string;
    
    /**
     * Status of the review
     */
    status: DyoaReviewStatus;
    
    /**
     * Comment from the reviewer (optional)
     */
    comment: string | null;
    
    /**
     * Photo being reviewed
     */
    photo: DyoaPhoto;
    
    /**
     * Avatar creator ID (only available after approval)
     */
    creator: string | null;
    
    /**
     * Social link for the avatar (optional)
     */
    social_link: string | null;
  }

  /**
   * Parameters for creating a DYOA
   */
  export interface DyoaParams {
    /**
     * Name for the avatar
     */
    name: string;
    
    /**
     * Age group of the avatar
     */
    age_group: AgeGroup;
    
    /**
     * Gender of the avatar
     */
    gender: Gender;
    
    /**
     * Detailed description of the avatar's appearance
     */
    more_details: string;
    
    /**
     * Description of the avatar's outfit
     */
    outfit_description: string;
    
    /**
     * Description of the avatar's background
     */
    background_description: string;
  }

  /**
   * Parameters for submitting a DYOA for review
   */
  export interface DyoaSubmitParams {
    /**
     * ID of the chosen photo to use for the avatar
     */
    chosen_photo_id: string;
  }

  /**
   * Response containing DYOA information
   */
  export interface DyoaResponse {
    /**
     * Unique identifier for the DYOA
     */
    id: string;
    
    /**
     * User ID of the creator
     */
    user: number;
    
    /**
     * Workspace ID
     */
    workspace: string;
    
    /**
     * Name of the avatar
     */
    name: string;
    
    /**
     * Age group of the avatar
     */
    age_group: AgeGroup;
    
    /**
     * Gender of the avatar
     */
    gender: Gender;
    
    /**
     * Detailed description of the avatar's appearance
     */
    more_details: string;
    
    /**
     * Description of the avatar's outfit
     */
    outfit_description: string;
    
    /**
     * Description of the avatar's background
     */
    background_description: string;
    
    /**
     * Array of generated photos
     */
    photos: DyoaPhoto[];
    
    /**
     * Array of reviews
     */
    reviews: DyoaReview[];
    
    /**
     * Status of the DYOA
     */
    status: DyoaStatus;
    
    /**
     * Creation timestamp
     */
    created_at: string;
    
    /**
     * Last update timestamp
     */
    updated_at: string;
  }
}