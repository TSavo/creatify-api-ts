import { Creatify } from '../index';
import { CreatifyApiOptions, AspectRatio, AiEditing, LipsyncV2, TextToSpeech } from '../types';
import { ICreatifyApiClientFactory } from '../types/api-client';
import { apiClientFactory } from '../client-factory';
import {
  AvatarApi,
  TextToSpeechApi,
  AiEditingApi,
  AiShortsApi,
  AiScriptsApi,
  MusicsApi,
  WorkspaceApi,
  LipsyncV2Api,
} from '../api';

/**
 * Batch processing options
 */
export interface BatchProcessingOptions {
  /**
   * Maximum number of concurrent tasks (default: 3)
   */
  concurrency?: number;

  /**
   * Whether to continue processing if one task fails (default: false)
   */
  continueOnError?: boolean;

  /**
   * Delay between starting new tasks in milliseconds (default: 500)
   */
  taskStartDelay?: number;
}

/**
 * Default batch processing options
 */
const DEFAULT_BATCH_OPTIONS: Required<BatchProcessingOptions> = {
  concurrency: 3,
  continueOnError: false,
  taskStartDelay: 500,
};

/**
 * Result of a batch processing operation
 */
export interface BatchResult<T> {
  /**
   * Array of successful results
   */
  successes: T[];

  /**
   * Array of errors, with the index of the task that failed
   */
  errors: Array<{ index: number; error: Error | unknown }>;

  /**
   * Whether all tasks were successful
   */
  allSuccessful: boolean;
}

/**
 * Utility class for processing multiple API tasks in batch
 */
export class BatchProcessorWithFactory {
  private api: Creatify;

  /**
   * Create a new BatchProcessor
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

    this.api = new Creatify(options);

    // Initialize API modules with the client factory
    this.api.avatar = new AvatarApi(options, clientFactory);
    this.api.textToSpeech = new TextToSpeechApi(options, clientFactory);
    this.api.aiEditing = new AiEditingApi(options, clientFactory);
    this.api.aiShorts = new AiShortsApi(options, clientFactory);
    this.api.aiScripts = new AiScriptsApi(options, clientFactory);
    this.api.musics = new MusicsApi(options, clientFactory);
    this.api.workspace = new WorkspaceApi(options, clientFactory);
    this.api.lipsyncV2 = new LipsyncV2Api(options, clientFactory);
  }

  /**
   * Process an array of tasks in batch with controlled concurrency
   * @param tasks Array of async functions to execute
   * @param options Batch processing options
   * @returns Promise resolving to the batch result
   */
  async processBatch<T>(
    tasks: Array<() => Promise<T>>,
    options: BatchProcessingOptions = {}
  ): Promise<BatchResult<T>> {
    // Merge options with defaults
    const opts: Required<BatchProcessingOptions> = {
      ...DEFAULT_BATCH_OPTIONS,
      ...options,
    };

    const result: BatchResult<T> = {
      successes: [],
      errors: [],
      allSuccessful: true,
    };

    // Keep track of active tasks
    let activeTasks = 0;
    let taskIndex = 0;

    // Create a queue of promises to resolve when all tasks are complete
    const queue: Promise<void>[] = [];

    // Process tasks
    while (taskIndex < tasks.length) {
      // Wait until we have an available slot
      if (activeTasks >= opts.concurrency) {
        await Promise.race(queue);
        continue;
      }

      // Start a task
      const currentIndex = taskIndex++;
      activeTasks++;

      // Define and create the task promise
      const taskPromise = (async () => {
        try {
          // Add delay between task starts if specified
          if (opts.taskStartDelay > 0 && currentIndex > 0) {
            await new Promise(resolve => setTimeout(resolve, opts.taskStartDelay));
          }

          // Execute the task
          const taskResult = await tasks[currentIndex]();
          result.successes.push(taskResult);
        } catch (error) {
          // Record the error
          result.errors.push({ index: currentIndex, error });
          result.allSuccessful = false;

          // Handle error based on options
          if (!opts.continueOnError) {
            throw error;
          }
        } finally {
          // Decrease active task count
          activeTasks--;

          // Remove this promise from the queue - find it by filtering instead of using indexOf
          const taskIndex = queue.findIndex(p => p === taskPromise);
          if (taskIndex !== -1) {
            queue.splice(taskIndex, 1);
          }
        }
      })();

      // Add to queue
      queue.push(taskPromise);

      // If we should stop on error and an error occurs, break out of the loop
      if (!opts.continueOnError && !result.allSuccessful) {
        break;
      }
    }

    // Wait for all remaining tasks to complete
    if (queue.length > 0) {
      await Promise.all(queue).catch(error => {
        // If continueOnError is false, this error will have already been recorded
        // But we need to catch it here to prevent it from bubbling up
        if (opts.continueOnError) {
          console.error('Unexpected error in batch processing:', error);
        }
      });
    }

    return result;
  }

  /**
   * Process an array of avatar video creation tasks in batch
   * @param avatarTasks Array of avatar tasks with text and avatarId
   * @param options Batch processing options
   * @returns Promise resolving to the batch result
   */
  async processAvatarBatch(
    avatarTasks: Array<{ text: string; avatarId: string; voiceId?: string; aspectRatio?: string }>,
    options: BatchProcessingOptions = {}
  ) {
    const tasks = avatarTasks.map(task => {
      return async () => {
        return this.api.avatar.createAndWaitForLipsync({
          text: task.text,
          creator: task.avatarId,
          voice_id: task.voiceId,
          aspect_ratio: task.aspectRatio as AspectRatio,
        });
      };
    });

    return this.processBatch(tasks, options);
  }

  /**
   * Process an array of text-to-speech tasks in batch
   * @param textToSpeechTasks Array of text-to-speech tasks with script and accent
   * @param options Batch processing options
   * @returns Promise resolving to the batch result
   */
  async processTextToSpeechBatch(
    textToSpeechTasks: Array<{ script: string; accent: string }>,
    options: BatchProcessingOptions = {}
  ) {
    const tasks = textToSpeechTasks.map(task => {
      return async () => {
        return this.api.textToSpeech.createAndWaitForTextToSpeech({
          script: task.script,
          accent: task.accent,
        });
      };
    });

    return this.processBatch(tasks, options);
  }

  /**
   * Process an array of AI editing tasks in batch
   * @param aiEditingTasks Array of AI editing tasks with videoUrl and editingStyle
   * @param options Batch processing options
   * @returns Promise resolving to the batch result
   */
  async processAiEditingBatch(
    aiEditingTasks: Array<{ videoUrl: string; editingStyle: string }>,
    options: BatchProcessingOptions = {}
  ) {
    const tasks = aiEditingTasks.map(task => {
      return async () => {
        return this.api.aiEditing.createAndWaitForAiEditing({
          video_url: task.videoUrl,
          editing_style: task.editingStyle as AiEditing.EditingStyle,
        });
      };
    });

    return this.processBatch(tasks, options);
  }

  /**
   * Create and wait for a lipsync task to complete
   */
  async createAndWaitForLipsync(params: {
    text: string;
    creator: string;
    voice_id?: string;
    aspect_ratio?: AspectRatio;
  }, pollingInterval = 2000) {
    return this.api.avatar.createAndWaitForLipsync(params, pollingInterval);
  }

  /**
   * Create and wait for a text-to-speech task to complete
   */
  async createAndWaitForTextToSpeech(params: {
    text: string;
    voice_id: string;
  } | TextToSpeech.TextToSpeechParams, pollingInterval = 2000) {
    // Convert to the expected format if needed
    const convertedParams = 'text' in params ? {
      script: params.text,
      accent: params.voice_id
    } : params;
    return this.api.textToSpeech.createAndWaitForTextToSpeech(convertedParams, pollingInterval);
  }

  /**
   * Create and wait for an AI editing task to complete
   */
  async createAndWaitForAiEditing(params: {
    video_url: string;
    editing_style: AiEditing.EditingStyle;
  }, pollingInterval = 2000) {
    return this.api.aiEditing.createAndWaitForAiEditing(params, pollingInterval);
  }

  /**
   * Process an array of AI Shorts tasks in batch
   * @param aiShortsTasks Array of AI Shorts tasks with prompt and aspectRatio
   * @param options Batch processing options
   * @returns Promise resolving to the batch result
   */
  async processAiShortsBatch(
    aiShortsTasks: Array<{
      prompt: string;
      aspectRatio: string;
      targetPlatform?: string;
      targetAudience?: string;
      language?: string;
    }>,
    options: BatchProcessingOptions = {}
  ) {
    const tasks = aiShortsTasks.map(task => {
      return async () => {
        return this.api.aiShorts.createAndWaitForAiShorts({
          prompt: task.prompt,
          aspect_ratio: task.aspectRatio as AspectRatio,
          target_platform: task.targetPlatform,
          target_audience: task.targetAudience,
          language: task.language,
        });
      };
    });

    return this.processBatch(tasks, options);
  }

  /**
   * Process an array of AI Scripts tasks in batch
   * @param aiScriptsTasks Array of AI Scripts tasks with prompt and other optional parameters
   * @param options Batch processing options
   * @returns Promise resolving to the batch result
   */
  async processAiScriptsBatch(
    aiScriptsTasks: Array<{
      prompt: string;
      targetPlatform?: string;
      targetAudience?: string;
      language?: string;
      scriptLength?: number;
    }>,
    options: BatchProcessingOptions = {}
  ) {
    const tasks = aiScriptsTasks.map(task => {
      return async () => {
        return this.api.aiScripts.createAndWaitForAiScript({
          prompt: task.prompt,
          target_platform: task.targetPlatform,
          target_audience: task.targetAudience,
          language: task.language,
          script_length: task.scriptLength,
        });
      };
    });

    return this.processBatch(tasks, options);
  }

  /**
   * Process an array of Lipsync v2 tasks in batch
   * @param lipsyncV2Tasks Array of Lipsync v2 tasks with videoInputs and aspectRatio
   * @param options Batch processing options
   * @returns Promise resolving to the batch result
   */
  async processLipsyncV2Batch(
    lipsyncV2Tasks: Array<{ videoInputs: LipsyncV2.LipsyncV2Params['video_inputs']; aspectRatio: string }>,
    options: BatchProcessingOptions = {}
  ) {
    const tasks = lipsyncV2Tasks.map(task => {
      return async () => {
        return this.api.lipsyncV2.createAndWaitForLipsyncV2({
          video_inputs: task.videoInputs,
          aspect_ratio: task.aspectRatio as AspectRatio,
        });
      };
    });

    return this.processBatch(tasks, options);
  }

  /**
   * Create and wait for an AI Shorts task to complete
   */
  async createAndWaitForAiShorts(params: {
    prompt: string;
    aspect_ratio: AspectRatio;
    target_platform?: string;
    target_audience?: string;
    language?: string;
  }, pollingInterval = 2000) {
    return this.api.aiShorts.createAndWaitForAiShorts(params, pollingInterval);
  }

  /**
   * Create and wait for an AI Script task to complete
   */
  async createAndWaitForAiScript(params: {
    prompt: string;
    target_platform?: string;
    target_audience?: string;
    language?: string;
    script_style?: string;
  }, pollingInterval = 2000) {
    return this.api.aiScripts.createAndWaitForAiScript(params, pollingInterval);
  }

  /**
   * Create and wait for a Lipsync v2 task to complete
   */
  async createAndWaitForLipsyncV2(params: {
    video_inputs: LipsyncV2.LipsyncV2Params['video_inputs'];
    aspect_ratio: AspectRatio;
  }, pollingInterval = 2000) {
    return this.api.lipsyncV2.createAndWaitForLipsyncV2(params, pollingInterval);
  }
}
