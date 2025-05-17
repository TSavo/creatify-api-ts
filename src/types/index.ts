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
   * Avatar information
   */
  export interface AvatarInfo {
    /**
     * Unique identifier for the avatar
     */
    avatar_id: string;
    
    /**
     * Display name of the avatar
     */
    name: string;
    
    /**
     * URL to avatar preview image
     */
    preview_url: string;
    
    /**
     * Avatar style (e.g., "normal", "casual")
     */
    style: string;
    
    /**
     * Additional tags for the avatar
     */
    tags: string[];
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
     */
    aspect_ratio?: AspectRatio;
    
    /**
     * Voice ID to use (optional)
     */
    voice_id?: string;
    
    /**
     * Background image URL (optional)
     */
    background_url?: string;
    
    /**
     * Webhook URL to be called when the video is ready (optional)
     */
    webhook_url?: string;
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
 */
export namespace UrlToVideo {
  /**
   * Parameters for creating a link
   */
  export interface LinkParams {
    /**
     * URL to extract content from
     */
    url: string;
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
    
    /**
     * AI-generated summary of the content
     */
    ai_summary?: string;
    
    /**
     * AI-generated target audiences for the content
     */
    ai_target_audiences?: any;
  }

  /**
   * Response when creating a link
   */
  export interface LinkResponse extends ApiResponse {
    /**
     * Unique identifier for the link
     */
    id: string;
    
    /**
     * Original URL
     */
    url: string;
    
    /**
     * Link data
     */
    link: LinkData;
    
    /**
     * Credits used for this operation
     */
    credits_used: number;
  }

  /**
   * Script styles for video generation
   */
  export type ScriptStyle = 
    'DontWorryWriter' | 
    'CreativeWriter' | 
    'EnthusiasticWriter' | 
    'EcommerceSalesWriter' | 
    'MinimalistWriter';

  /**
   * Visual styles for video generation
   */
  export type VisualStyle = 
    'DynamicProductTemplate' | 
    'SimpleCleanTemplate' | 
    'MotionGraphicsTemplate' | 
    'EcommerceShowcaseTemplate' | 
    'ModernMinimalistTemplate';

  /**
   * Parameters for creating a video from a link
   */
  export interface VideoFromLinkParams {
    /**
     * Link ID to use for the video
     */
    link: string;
    
    /**
     * Visual style to use for the video
     */
    visual_style: VisualStyle;
    
    /**
     * Script style to use for the video
     */
    script_style: ScriptStyle;
    
    /**
     * Aspect ratio of the generated video
     */
    aspect_ratio: AspectRatio;
    
    /**
     * Video length in seconds
     */
    video_length?: number;
    
    /**
     * Language to use for the video
     */
    language?: string;
    
    /**
     * Target audience for the video
     */
    target_audience?: string;
    
    /**
     * Target platform for the video (e.g., "Tiktok", "Instagram")
     */
    target_platform?: string;
    
    /**
     * Webhook URL to be called when the video is ready (optional)
     */
    webhook_url?: string;
  }

  /**
   * Response when creating a video from a link
   */
  export interface VideoResponse extends ApiResponse {
    /**
     * Unique identifier for the video
     */
    id: string;
    
    /**
     * Status of the video generation
     */
    status: 'pending' | 'processing' | 'done' | 'error';
  }

  /**
   * Response when getting a video result
   */
  export interface VideoResultResponse extends VideoResponse {
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
 * Text to Speech API types
 */
export namespace TextToSpeech {
  /**
   * Parameters for creating a text-to-speech task
   */
  export interface TextToSpeechParams {
    /**
     * Text script to be converted to speech
     */
    script: string;
    
    /**
     * Accent/voice ID to use for the speech
     */
    accent: string;
    
    /**
     * Webhook URL to be called when the audio is ready (optional)
     */
    webhook_url?: string;
  }

  /**
   * Response when creating a text-to-speech task
   */
  export interface TextToSpeechResponse extends ApiResponse {
    /**
     * ID of the created text-to-speech task
     */
    id: string;
    
    /**
     * Status of the text-to-speech task
     */
    status: 'pending' | 'processing' | 'done' | 'error';
  }

  /**
   * Response when getting a text-to-speech task
   */
  export interface TextToSpeechResultResponse extends TextToSpeechResponse {
    /**
     * Output URL of the generated audio (only available when status is 'done')
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