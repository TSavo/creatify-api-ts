import { Creatify } from '../index';
import { CreatifyApiOptions } from '../types';
import { ICreatifyApiClientFactory } from '../types/api-client';
import { apiClientFactory } from '../client-factory';

/**
 * A utility class to simplify avatar video creation
 */
export class VideoCreatorWithFactory {
  private creatify: Creatify;
  private avatarCache: Record<string, any> = {};
  private voiceCache: Record<string, any> = {};
  private avatarsLoaded = false;
  private voicesLoaded = false;

  /**
   * Create a new VideoCreator instance
   * @param apiIdOrOptions API ID or full options object
   * @param apiKey API key (only required if apiIdOrOptions is a string)
   * @param clientFactory Optional client factory for testing purposes
   */
  constructor(
    apiIdOrOptions: string | CreatifyApiOptions,
    apiKey?: string | ICreatifyApiClientFactory,
    clientFactory: ICreatifyApiClientFactory = apiClientFactory
  ) {
    // Handle different constructor argument formats
    const options: CreatifyApiOptions =
      typeof apiIdOrOptions === 'string'
        ? { apiId: apiIdOrOptions, apiKey: apiKey as string }
        : apiIdOrOptions;

    this.creatify = new Creatify(options);
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

    const avatars = await this.creatify.avatar.getAvatars();

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

    const voices = await this.creatify.avatar.getVoices();

    for (const voice of voices) {
      this.voiceCache[voice.voice_id] = voice;
    }

    this.voicesLoaded = true;
    return voices;
  }

  /**
   * Create a video with an avatar speaking the provided text
   * @param params Video creation parameters
   * @param pollingInterval Optional interval for checking video status (ms)
   */
  async createVideo(params: VideoCreationParams, pollingInterval = 2000) {
    // Extract parameters
    const { text, avatarId, voiceId, aspectRatio } = params;

    // Create the lipsync video
    return this.creatify.avatar.createAndWaitForLipsync(
      {
        text,
        creator: avatarId,
        voice_id: voiceId,
        aspect_ratio: aspectRatio,
      },
      pollingInterval
    );
  }

  /**
   * Find an avatar by name or partial name match
   * @param name Name or partial name to search for
   */
  async findAvatarByName(name: string): Promise<any | null> {
    if (!this.avatarsLoaded) {
      await this.loadAvatars();
    }

    name = name.toLowerCase();

    // First try exact match
    for (const avatar of Object.values(this.avatarCache)) {
      if (avatar.name.toLowerCase() === name) {
        return avatar;
      }
    }

    // Then try partial match
    for (const avatar of Object.values(this.avatarCache)) {
      if (avatar.name.toLowerCase().includes(name)) {
        return avatar;
      }
    }

    return null;
  }

  /**
   * Find a voice by name or partial name match
   * @param name Name or partial name to search for
   */
  async findVoiceByName(name: string): Promise<any | null> {
    if (!this.voicesLoaded) {
      await this.loadVoices();
    }

    name = name.toLowerCase();

    // First try exact match
    for (const voice of Object.values(this.voiceCache)) {
      if (voice.name.toLowerCase() === name) {
        return voice;
      }
    }

    // Then try partial match
    for (const voice of Object.values(this.voiceCache)) {
      if (voice.name.toLowerCase().includes(name)) {
        return voice;
      }
    }

    return null;
  }

  /**
   * Create a video using avatar and voice names instead of IDs
   * @param params Simplified video creation parameters
   * @param pollingInterval Optional interval for checking video status (ms)
   */
  async createVideoWithNames(params: SimplifiedVideoCreationParams, pollingInterval = 2000) {
    const { text, avatarName, voiceName, aspectRatio } = params;

    // Find the avatar and voice by name
    const [avatar, voice] = await Promise.all([
      this.findAvatarByName(avatarName),
      this.findVoiceByName(voiceName),
    ]);

    if (!avatar) {
      throw new Error(`Avatar not found with name: ${avatarName}`);
    }

    if (!voice) {
      throw new Error(`Voice not found with name: ${voiceName}`);
    }

    // Create the video
    return this.createVideo(
      {
        text,
        avatarId: avatar.id || avatar.avatar_id,
        voiceId: voice.id || voice.voice_id,
        aspectRatio,
      },
      pollingInterval
    );
  }
}

/**
 * Parameters for creating a video
 */
export interface VideoCreationParams {
  /**
   * The text for the avatar to speak
   */
  text: string;

  /**
   * The ID of the avatar to use
   */
  avatarId: string;

  /**
   * The ID of the voice to use
   */
  voiceId: string;

  /**
   * Optional aspect ratio for the video (default: '16:9')
   */
  aspectRatio?: '16:9' | '1:1' | '9:16';
}

/**
 * Simplified parameters for creating a video using names instead of IDs
 */
export interface SimplifiedVideoCreationParams {
  /**
   * The text for the avatar to speak
   */
  text: string;

  /**
   * The name of the avatar to use
   */
  avatarName: string;

  /**
   * The name of the voice to use
   */
  voiceName: string;

  /**
   * Optional aspect ratio for the video (default: '16:9')
   */
  aspectRatio?: '16:9' | '1:1' | '9:16';
}
