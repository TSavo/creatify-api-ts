import { Creatify } from '../index';

/**
 * A utility class to simplify avatar video creation
 */
export class VideoCreator {
  private creatify: Creatify;
  private avatarCache: Record<string, any> = {};
  private voiceCache: Record<string, any> = {};
  private avatarsLoaded = false;
  private voicesLoaded = false;

  /**
   * Create a new VideoCreator instance
   * @param apiId Your Creatify API ID
   * @param apiKey Your Creatify API Key
   */
  constructor(apiId: string, apiKey: string) {
    this.creatify = new Creatify({
      apiId,
      apiKey,
    });
  }

  /**
   * Preload avatars and voices for faster video creation
   */
  async preload() {
    await Promise.all([
      this.loadAvatars(),
      this.loadVoices()
    ]);
    
    return {
      avatars: Object.keys(this.avatarCache).length,
      voices: Object.keys(this.voiceCache).length
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
   * Find an avatar by name (partial match)
   * @param name Avatar name to search for
   */
  async findAvatarByName(name: string) {
    if (!this.avatarsLoaded) {
      await this.loadAvatars();
    }
    
    const normalizedName = name.toLowerCase();
    
    return Object.values(this.avatarCache).find(avatar => 
      avatar.name.toLowerCase().includes(normalizedName)
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
      voice.name.toLowerCase().includes(normalizedName)
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
    // Default values
    const pollInterval = options.pollInterval || 5000;
    const maxPollingAttempts = options.maxPollingAttempts || 30;
    const aspectRatio = options.aspectRatio || "16:9";
    
    // Resolve avatar ID
    let avatarId = options.avatarId;
    if (!avatarId && options.avatarName) {
      const avatar = await this.findAvatarByName(options.avatarName);
      if (!avatar) {
        throw new Error(`No avatar found matching name: ${options.avatarName}`);
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
        throw new Error(`No voice found matching name: ${options.voiceName}`);
      }
      voiceId = voice.voice_id;
    }
    
    // Create the lipsync video
    const lipsyncResponse = await this.creatify.avatar.createLipsync({
      text: options.script,
      creator: avatarId,
      aspect_ratio: aspectRatio as any,
      voice_id: voiceId
    });
    
    // Poll for completion
    let lipsyncResult = await this.creatify.avatar.getLipsync(lipsyncResponse.id);
    let attempts = 0;
    
    while (
      lipsyncResult.status !== 'done' && 
      lipsyncResult.status !== 'error' && 
      attempts < maxPollingAttempts
    ) {
      // Wait between checks
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Check status again
      lipsyncResult = await this.creatify.avatar.getLipsync(lipsyncResponse.id);
      attempts++;
    }
    
    // Check final result
    if (lipsyncResult.status === 'done' && lipsyncResult.output) {
      return {
        url: lipsyncResult.output,
        status: 'done',
        taskId: lipsyncResponse.id
      };
    } else {
      throw new Error(
        lipsyncResult.error_message || 
        `Video generation failed or timed out. Status: ${lipsyncResult.status}`
      );
    }
  }

  /**
   * Create a video with multiple avatars having a conversation
   * @param conversations Array of conversation segments with different avatars
   * @param options Additional options
   * @returns The URL of the generated video
   */
  async createConversation(
    conversations: Array<{
      avatarName?: string;
      avatarId?: string;
      voiceName?: string;
      voiceId?: string;
      script: string;
    }>,
    options: {
      backgroundUrl?: string;
      aspectRatio?: string;
      pollInterval?: number;
      maxPollingAttempts?: number;
    } = {}
  ) {
    // Default values
    const pollInterval = options.pollInterval || 5000;
    const maxPollingAttempts = options.maxPollingAttempts || 30;
    const aspectRatio = options.aspectRatio || "16:9";
    const backgroundUrl = options.backgroundUrl || "https://video.creatify.ai/bg.jpg";
    
    // Prepare video inputs
    const videoInputs = [];
    
    for (const conversation of conversations) {
      // Resolve avatar ID
      let avatarId = conversation.avatarId;
      if (!avatarId && conversation.avatarName) {
        const avatar = await this.findAvatarByName(conversation.avatarName);
        if (!avatar) {
          throw new Error(`No avatar found matching name: ${conversation.avatarName}`);
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
          throw new Error(`No voice found matching name: ${conversation.voiceName}`);
        }
        voiceId = voice.voice_id;
      }
      
      videoInputs.push({
        character: {
          type: "avatar" as const,
          avatar_id: avatarId,
          avatar_style: "normal",
          offset: { x: -0.23, y: 0.35 }
        },
        voice: {
          type: "text" as const,
          input_text: conversation.script,
          voice_id: voiceId
        },
        background: {
          type: "image" as const,
          url: backgroundUrl
        },
        caption_setting: {
          style: "normal-black",
          offset: { x: 0, y: 0.45 }
        }
      });
    }
    
    // Create the multi-avatar lipsync video
    const multiAvatarResponse = await this.creatify.avatar.createMultiAvatarLipsync({
      video_inputs: videoInputs,
      aspect_ratio: aspectRatio as any
    });
    
    // Poll for completion
    let result = await this.creatify.avatar.getLipsync(multiAvatarResponse.id);
    let attempts = 0;
    
    while (
      result.status !== 'done' && 
      result.status !== 'error' && 
      attempts < maxPollingAttempts
    ) {
      // Wait between checks
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Check status again
      result = await this.creatify.avatar.getLipsync(multiAvatarResponse.id);
      attempts++;
    }
    
    // Check final result
    if (result.status === 'done' && result.output) {
      return {
        url: result.output,
        status: 'done',
        taskId: multiAvatarResponse.id
      };
    } else {
      throw new Error(
        result.error_message || 
        `Video generation failed or timed out. Status: ${result.status}`
      );
    }
  }
}