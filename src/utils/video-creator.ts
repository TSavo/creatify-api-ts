import { Creatify } from '../index';
import { AvatarApi } from '../api';
import { CreatifyApiOptions } from '../types';
import { apiClientFactory } from '../client-factory';
import { ICreatifyApiClientFactory } from '../types/api-client';

/**
 * A utility class to simplify avatar video creation
 */
export class VideoCreator {
  private creatify: Creatify;
  private avatarApi: AvatarApi;
  private avatarCache: Record<string, any> = {};
  private voiceCache: Record<string, any> = {};
  private avatarsLoaded = false;
  private voicesLoaded = false;

  /**
   * Create a new VideoCreator instance
   * @param apiIdOrOptions Your Creatify API ID or options object
   * @param apiKey Your Creatify API Key (optional if options object is used)
   * @param clientFactory Optional factory for creating API clients (useful for testing)
   */
  constructor(
    apiIdOrOptions: string | CreatifyApiOptions,
    apiKey?: string,
    clientFactory: ICreatifyApiClientFactory = apiClientFactory
  ) {
    const options: CreatifyApiOptions =
      typeof apiIdOrOptions === 'string'
        ? { apiId: apiIdOrOptions, apiKey: apiKey || '' }
        : apiIdOrOptions;

    this.creatify = new Creatify(options);
    // Create a separate AvatarApi that uses the provided clientFactory
    this.avatarApi = new AvatarApi(options, clientFactory);
  }

  /**
   * Preload avatars and voices for faster video creation
   */
  async preload() {
    await Promise.all([this.loadAvatars(), this.loadVoices()]);

    return {
      avatars: Object.keys(this.avatarCache).length,
      voices: Object.keys(this.voiceCache).length,
    };
  }

  /**
   * Load and cache all available avatars
   */
  async loadAvatars() {
    if (this.avatarsLoaded) return Object.values(this.avatarCache);

    const avatars = await this.avatarApi.getAvatars();

    for (const avatar of avatars) {
      this.avatarCache[avatar.id] = avatar;
    }

    this.avatarsLoaded = true;
    return avatars;
  }

  /**
   * Load and cache all available voices
   */
  async loadVoices() {
    if (this.voicesLoaded) return Object.values(this.voiceCache);

    const voices = await this.avatarApi.getVoices();

    for (const voice of voices) {
      this.voiceCache[voice.voice_id] = voice;
    }

    this.voicesLoaded = true;
    return voices;
  }

  /**
   * Find an avatar by name (partial match)
   * @param name Avatar name to search for
   */
  async findAvatarByName(name: string) {
    if (!this.avatarsLoaded) {
      await this.loadAvatars();
    }

    const normalizedName = name.toLowerCase();

    return Object.values(this.avatarCache).find(avatar =>
      avatar.name?.toLowerCase().includes(normalizedName)
    );
  }

  /**
   * Find a voice by name (partial match)
   * @param name Voice name to search for
   */
  async findVoiceByName(name: string) {
    if (!this.voicesLoaded) {
      await this.loadVoices();
    }

    const normalizedName = name.toLowerCase();

    return Object.values(this.voiceCache).find(voice =>
      voice.name?.toLowerCase().includes(normalizedName)
    );
  }

  /**
   * Create a video with a single avatar speaking
   * @param options Configuration options for the video
   * @returns The URL of the generated video
   */
  async createVideo(options: {
    avatarName?: string;
    avatarId?: string;
    voiceName?: string;
    voiceId?: string;
    script: string;
    aspectRatio?: string;
    pollInterval?: number;
    maxPollingAttempts?: number;
  }) {
    try {
      // Default values
      const pollInterval = options.pollInterval || 5000;
      const maxPollingAttempts = options.maxPollingAttempts || 30;
      const aspectRatio = options.aspectRatio || '16:9';

      // Resolve avatar ID
      let avatarId = options.avatarId;
      if (!avatarId && options.avatarName) {
        const avatar = await this.findAvatarByName(options.avatarName);
        if (!avatar) {
          throw new Error(`Avatar with name "${options.avatarName}" not found`);
        }
        avatarId = avatar.avatar_id;
      }

      if (!avatarId) {
        // If no avatar specified, use the first available one
        const avatars = await this.loadAvatars();
        if (avatars.length === 0) {
          throw new Error('No avatars available. Please check your API credentials.');
        }
        avatarId = avatars[0].avatar_id;
      }

      // Resolve voice ID
      let voiceId = options.voiceId;
      if (!voiceId && options.voiceName) {
        const voice = await this.findVoiceByName(options.voiceName);
        if (!voice) {
          throw new Error(`Voice with name "${options.voiceName}" not found`);
        }
        voiceId = voice.voice_id;
      }

      // Create the lipsync video
      const lipsyncResponse = await this.avatarApi.createLipsync({
        text: options.script,
        creator: avatarId || '',
        aspect_ratio: aspectRatio as any,
        voice_id: voiceId,
      });

      // Ensure we have a valid response ID
      if (!lipsyncResponse || !lipsyncResponse.id) {
        throw new Error('Failed to create lipsync video: Invalid response from API');
      }

      // Poll for completion
      let lipsyncResult = await this.avatarApi.getLipsync(lipsyncResponse.id);
      let attempts = 0;

      while (
        lipsyncResult.status !== 'done' &&
        lipsyncResult.status !== 'error' &&
        attempts < maxPollingAttempts
      ) {
        // Wait between checks
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        // Check status again
        lipsyncResult = await this.avatarApi.getLipsync(lipsyncResponse.id);
        attempts++;
      }

      // Check final result
      if (lipsyncResult.status === 'done' && lipsyncResult.output) {
        return {
          id: lipsyncResponse.id,
          status: 'done',
          url: lipsyncResult.output,
        };
      } else {
        throw new Error(
          lipsyncResult.error_message ||
            `Video generation failed or timed out. Status: ${lipsyncResult.status}`
        );
      }
    } catch (error: any) {
      // Ensure the error is properly thrown with the original message
      throw error instanceof Error
        ? error
        : new Error(error?.message || 'An error occurred with the API request');
    }
  }

  /**
   * Create a video with multiple avatars having a conversation
   * @param options Configuration options for the conversation
   * @returns The URL of the generated video
   */
  async createConversation(options: {
    conversation: Array<{
      avatarName?: string;
      avatarId?: string;
      voiceName?: string;
      voiceId?: string;
      text: string;
    }>;
    backgroundUrl?: string;
    aspectRatio?: string;
    pollInterval?: number;
    maxPollingAttempts?: number;
  }) {
    try {
      const conversations = options.conversation;
      // Default values
      const pollInterval = options.pollInterval || 5000;
      const maxPollingAttempts = options.maxPollingAttempts || 30;
      const aspectRatio = options.aspectRatio || '16:9';
      const backgroundUrl = options.backgroundUrl || 'https://video.creatify.ai/bg.jpg';

      // Prepare video inputs
      const videoInputs = [];

      for (const conversation of conversations) {
        // Resolve avatar ID
        let avatarId = conversation.avatarId;
        if (!avatarId && conversation.avatarName) {
          const avatar = await this.findAvatarByName(conversation.avatarName);
          if (!avatar) {
            throw new Error(`Avatar with name "${conversation.avatarName}" not found`);
          }
          avatarId = avatar.avatar_id;
        }

        if (!avatarId) {
          // If no avatar specified, use the first available one
          const avatars = await this.loadAvatars();
          if (avatars.length === 0) {
            throw new Error('No avatars available. Please check your API credentials.');
          }
          avatarId = avatars[0].avatar_id;
        }

        // Resolve voice ID
        let voiceId = conversation.voiceId;
        if (!voiceId && conversation.voiceName) {
          const voice = await this.findVoiceByName(conversation.voiceName);
          if (!voice) {
            throw new Error(`Voice with name "${conversation.voiceName}" not found`);
          }
          voiceId = voice.voice_id;
        }

        videoInputs.push({
          character: {
            type: 'avatar' as const,
            avatar_id: avatarId || '',
            avatar_style: 'normal',
            offset: { x: -0.23, y: 0.35 },
          },
          voice: {
            type: 'text' as const,
            input_text: conversation.text,
            voice_id: voiceId || '',
          },
          background: {
            type: 'image' as const,
            url: backgroundUrl,
          },
          caption_setting: {
            style: 'normal-black',
            offset: { x: 0, y: 0.45 },
          },
        });
      }

      // Create the multi-avatar lipsync video
      const multiAvatarResponse = await this.avatarApi.createMultiAvatarLipsync({
        video_inputs: videoInputs,
        aspect_ratio: aspectRatio as any,
      });

      // Ensure we have a valid response ID
      if (!multiAvatarResponse || !multiAvatarResponse.id) {
        throw new Error('Failed to create multi-avatar lipsync video: Invalid response from API');
      }

      // Poll for completion
      let result = await this.avatarApi.getLipsync(multiAvatarResponse.id);
      let attempts = 0;

      while (
        result.status !== 'done' &&
        result.status !== 'error' &&
        attempts < maxPollingAttempts
      ) {
        // Wait between checks
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        // Check status again
        result = await this.avatarApi.getLipsync(multiAvatarResponse.id);
        attempts++;
      }

      // Check final result
      if (result.status === 'done' && result.output) {
        return {
          id: multiAvatarResponse.id,
          status: 'done',
          url: result.output,
        };
      } else {
        throw new Error(
          result.error_message || `Video generation failed or timed out. Status: ${result.status}`
        );
      }
    } catch (error: any) {
      // Ensure the error is properly thrown with the original message
      throw error instanceof Error
        ? error
        : new Error(error?.message || 'An error occurred with the API request');
    }
  }
}
