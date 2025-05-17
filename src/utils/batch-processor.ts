import { Creatify } from '../index';
import { CreatifyApiOptions } from '../types';

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
  taskStartDelay: 500
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
  errors: Array<{ index: number; error: any }>;
  
  /**
   * Whether all tasks were successful
   */
  allSuccessful: boolean;
}

/**
 * Utility class for processing multiple API tasks in batch
 */
export class BatchProcessor {
  private api: Creatify;
  
  /**
   * Create a new BatchProcessor
   * @param apiIdOrOptions API ID or full options object
   * @param apiKey API key (only required if apiIdOrOptions is a string)
   */
  constructor(
    apiIdOrOptions: string | CreatifyApiOptions,
    apiKey?: string
  ) {
    // Handle different constructor argument formats
    const options: CreatifyApiOptions = typeof apiIdOrOptions === 'string'
      ? { apiId: apiIdOrOptions, apiKey: apiKey! }
      : apiIdOrOptions;
      
    this.api = new Creatify(options);
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
      ...options
    };
    
    const result: BatchResult<T> = {
      successes: [],
      errors: [],
      allSuccessful: true
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
          
          // Remove this promise from the queue
          const index = queue.indexOf(taskPromise);
          if (index !== -1) {
            queue.splice(index, 1);
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
          aspect_ratio: task.aspectRatio as any
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
          accent: task.accent
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
          editing_style: task.editingStyle as any
        });
      };
    });
    
    return this.processBatch(tasks, options);
  }
}