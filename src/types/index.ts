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
  // Add TTS types here when implementing this part of the API
}

/**
 * AI Editing API types
 */
export namespace AiEditing {
  // Add AI Editing types here when implementing this part of the API
}

/**
 * Custom Templates API types
 */
export namespace CustomTemplates {
  // Add Custom Templates types here when implementing this part of the API
}

/**
 * DYOA (Design Your Own Avatar) API types
 */
export namespace DYOA {
  // Add DYOA types here when implementing this part of the API
}