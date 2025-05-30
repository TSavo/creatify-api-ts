import { promises as fs } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import axios from 'axios';

/**
 * Integration test configuration and utilities
 */
export interface IntegrationTestConfig {
  apiId: string;
  apiKey: string;
  outputDir: string;
  timeout: number;
}

/**
 * File metadata from ffprobe
 */
export interface MediaFileInfo {
  duration: number;
  size: number;
  format: string;
  width?: number;
  height?: number;
  bitrate?: number;
  hasVideo: boolean;
  hasAudio: boolean;
}

/**
 * Test resource tracking for cleanup
 */
export class TestResourceTracker {
  private createdFiles: string[] = [];
  private createdTasks: Array<{ id: string; type: string }> = [];

  addFile(filePath: string): void {
    this.createdFiles.push(filePath);
  }

  addTask(id: string, type: string): void {
    this.createdTasks.push({ id, type });
  }

  async cleanup(): Promise<void> {
    // Clean up files
    for (const filePath of this.createdFiles) {
      try {
        await fs.unlink(filePath);
        console.log(`Cleaned up file: ${filePath}`);
      } catch (error) {
        console.warn(`Failed to clean up file ${filePath}:`, error);
      }
    }

    this.createdFiles = [];
    this.createdTasks = [];
  }

  getCreatedFiles(): string[] {
    return [...this.createdFiles];
  }

  getCreatedTasks(): Array<{ id: string; type: string }> {
    return [...this.createdTasks];
  }
}

/**
 * Get integration test configuration from environment variables
 */
export function getIntegrationConfig(): IntegrationTestConfig {
  const apiId = process.env.CREATIFY_API_ID;
  const apiKey = process.env.CREATIFY_API_KEY;

  if (!apiId || !apiKey) {
    throw new Error(
      'Integration tests require CREATIFY_API_ID and CREATIFY_API_KEY environment variables'
    );
  }

  return {
    apiId,
    apiKey,
    outputDir: join(process.cwd(), 'tests', 'integration', 'output'),
    timeout: 300000, // 5 minutes for video generation
  };
}

/**
 * Check if integration tests should run (API credentials are provided)
 */
export function shouldRunIntegrationTests(): boolean {
  const apiId = process.env.CREATIFY_API_ID;
  const apiKey = process.env.CREATIFY_API_KEY;
  return !!(apiId && apiKey);
}

/**
 * Ensure output directory exists
 */
export async function ensureOutputDir(outputDir: string): Promise<void> {
  try {
    await fs.access(outputDir);
  } catch {
    await fs.mkdir(outputDir, { recursive: true });
  }
}

/**
 * Download a file from URL to local path
 */
export async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  });

  const writer = require('fs').createWriteStream(outputPath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stats = await fs.stat(filePath);
  return stats.size;
}

/**
 * Run ffprobe on a media file to get metadata
 */
export async function getMediaInfo(filePath: string): Promise<MediaFileInfo> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath
    ]);

    let stdout = '';
    let stderr = '';

    ffprobe.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ffprobe.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed with code ${code}: ${stderr}`));
        return;
      }

      try {
        const data = JSON.parse(stdout);
        const format = data.format;
        const streams = data.streams || [];

        const videoStream = streams.find((s: any) => s.codec_type === 'video');
        const audioStream = streams.find((s: any) => s.codec_type === 'audio');

        const info: MediaFileInfo = {
          duration: parseFloat(format.duration) || 0,
          size: parseInt(format.size) || 0,
          format: format.format_name || 'unknown',
          bitrate: parseInt(format.bit_rate) || 0,
          hasVideo: !!videoStream,
          hasAudio: !!audioStream,
        };

        if (videoStream) {
          info.width = videoStream.width;
          info.height = videoStream.height;
        }

        resolve(info);
      } catch (error) {
        reject(new Error(`Failed to parse ffprobe output: ${error}`));
      }
    });

    ffprobe.on('error', (error) => {
      reject(new Error(`Failed to run ffprobe: ${error}`));
    });
  });
}

/**
 * Wait for a task to complete with polling
 */
export async function waitForTaskCompletion<T>(
  taskId: string,
  getTaskStatus: (id: string) => Promise<T & { status: string }>,
  maxAttempts: number = 60,
  pollInterval: number = 5000
): Promise<T & { status: string }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const task = await getTaskStatus(taskId);
    
    if (task.status === 'done' || task.status === 'completed') {
      return task;
    }
    
    if (task.status === 'failed' || task.status === 'error') {
      throw new Error(`Task ${taskId} failed with status: ${task.status}`);
    }
    
    console.log(`Task ${taskId} status: ${task.status} (attempt ${attempt + 1}/${maxAttempts})`);
    
    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  throw new Error(`Task ${taskId} did not complete within ${maxAttempts} attempts`);
}

/**
 * Generate a unique filename with timestamp
 */
export function generateUniqueFilename(prefix: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Short test content samples
 */
export const TEST_CONTENT = {
  SHORT_TEXTS: [
    "The quick brown fox jumped over the lazy dog. This is a test video. Thank you for watching.",
    "Hello world! This is integration testing. All systems working perfectly.",
    "Testing API functionality. Short and sweet content. Integration test complete.",
  ],
  URLS: [
    "https://example.com",
    "https://httpbin.org/html",
    "https://jsonplaceholder.typicode.com",
  ],
};
