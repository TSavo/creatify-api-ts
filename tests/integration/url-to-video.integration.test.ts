import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { join } from 'path';
import { Creatify } from '../../src';
import {
  getIntegrationConfig,
  ensureOutputDir,
  downloadFile,
  getFileSize,
  getMediaInfo,
  waitForTaskCompletion,
  generateUniqueFilename,
  TestResourceTracker,
  TEST_CONTENT,
} from './setup';

describe('URL-to-Video API Integration Tests', () => {
  let creatify: Creatify;
  let config: ReturnType<typeof getIntegrationConfig>;
  let resourceTracker: TestResourceTracker;

  beforeAll(async () => {
    try {
      config = getIntegrationConfig();
      await ensureOutputDir(config.outputDir);
      
      creatify = new Creatify({
        apiId: config.apiId,
        apiKey: config.apiKey,
      });

      console.log('URL-to-Video integration tests initialized');
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping URL-to-Video integration tests - API credentials not provided');
        return;
      }
      throw error;
    }
  }, 30000);

  beforeEach(() => {
    resourceTracker = new TestResourceTracker();
  });

  afterAll(async () => {
    if (resourceTracker) {
      await resourceTracker.cleanup();
    }
  });

  describe('Link Creation and Management', () => {
    it('should create a link from URL', async () => {
      const testUrl = TEST_CONTENT.URLS[0];
      
      console.log(`Creating link from URL: ${testUrl}`);
      
      const linkResponse = await creatify.urlToVideo.createLink({
        url: testUrl,
      });
      
      resourceTracker.addTask(linkResponse.id, 'link');
      
      expect(linkResponse).toHaveProperty('id');
      expect(linkResponse).toHaveProperty('url');
      expect(linkResponse.url).toBe(testUrl);
      expect(typeof linkResponse.id).toBe('string');
      
      console.log(`Link created: ${linkResponse.id}`);
    });

    it('should retrieve created link', async () => {
      const testUrl = TEST_CONTENT.URLS[1];
      
      // Create a link
      const linkResponse = await creatify.urlToVideo.createLink({
        url: testUrl,
      });
      
      resourceTracker.addTask(linkResponse.id, 'link');
      
      // Retrieve the link
      const retrievedLink = await creatify.urlToVideo.getLink(linkResponse.id);
      
      expect(retrievedLink).toHaveProperty('id');
      expect(retrievedLink.id).toBe(linkResponse.id);
      expect(retrievedLink).toHaveProperty('url');
      expect(retrievedLink.url).toBe(testUrl);
      
      console.log(`Retrieved link: ${retrievedLink.id}, URL: ${retrievedLink.url}`);
    });

    it('should list all links', async () => {
      const links = await creatify.urlToVideo.getLinks();
      
      expect(links).toBeInstanceOf(Array);
      expect(links.length).toBeGreaterThan(0);
      
      const link = links[0];
      expect(link).toHaveProperty('id');
      expect(link).toHaveProperty('url');
      expect(typeof link.id).toBe('string');
      expect(typeof link.url).toBe('string');
      
      console.log(`Found ${links.length} links in account`);
    });
  });

  describe('Video Generation from URL', () => {
    it('should create video from link and validate file', async () => {
      const testUrl = TEST_CONTENT.URLS[0];
      
      console.log(`Creating video from URL: ${testUrl}`);
      
      // First create a link
      const linkResponse = await creatify.urlToVideo.createLink({
        url: testUrl,
      });
      
      resourceTracker.addTask(linkResponse.id, 'link');
      
      // Create video from the link
      const videoResponse = await creatify.urlToVideo.createVideoFromLink({
        link: linkResponse.id,
        visual_style: 'DynamicProductTemplate',
        script_style: 'EnthusiasticWriter',
        aspect_ratio: '16:9',
        video_length: 15, // Very short video
        language: 'en',
        target_audience: 'general',
        target_platform: 'Youtube',
      });
      
      resourceTracker.addTask(videoResponse.id, 'url-video');
      
      expect(videoResponse).toHaveProperty('id');
      expect(videoResponse).toHaveProperty('status');
      expect(typeof videoResponse.id).toBe('string');
      
      console.log(`Video task created: ${videoResponse.id}`);
      
      // Wait for completion (URL-to-Video can take longer)
      const completedTask = await waitForTaskCompletion(
        videoResponse.id,
        (id) => creatify.urlToVideo.getVideoFromLink(id),
        120, // 120 attempts (10 minutes)
        5000 // 5 second intervals
      );
      
      expect(completedTask.status).toBe('done');
      expect(completedTask).toHaveProperty('output');
      expect(typeof completedTask.output).toBe('string');
      expect(completedTask.output).toMatch(/^https?:\/\//);
      
      console.log(`Video completed: ${completedTask.output}`);
      
      // Download and validate the video file
      const filename = generateUniqueFilename('url-video-test', 'mp4');
      const outputPath = join(config.outputDir, filename);
      
      await downloadFile(completedTask.output, outputPath);
      resourceTracker.addFile(outputPath);
      
      // Validate file exists and has content
      const fileSize = await getFileSize(outputPath);
      expect(fileSize).toBeGreaterThan(0);
      console.log(`Downloaded video file size: ${fileSize} bytes`);
      
      // Validate with ffprobe
      const mediaInfo = await getMediaInfo(outputPath);
      expect(mediaInfo.duration).toBeGreaterThan(0);
      expect(mediaInfo.hasVideo).toBe(true);
      expect(mediaInfo.hasAudio).toBe(true);
      expect(mediaInfo.width).toBeGreaterThan(0);
      expect(mediaInfo.height).toBeGreaterThan(0);
      
      console.log(`Video info: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}, ${mediaInfo.format}`);
      
      // Validate credits were used
      expect(completedTask).toHaveProperty('credits_used');
      expect(completedTask.credits_used).toBeGreaterThan(0);
    }, 600000); // 10 minute timeout for URL-to-Video

    it('should create video using convenience method', async () => {
      const testUrl = TEST_CONTENT.URLS[1];
      
      console.log('Creating URL-to-Video using convenience method...');
      
      // First create a link
      const linkResponse = await creatify.urlToVideo.createLink({
        url: testUrl,
      });
      
      resourceTracker.addTask(linkResponse.id, 'link');
      
      // Use the convenience method that waits for completion
      const completedVideo = await creatify.urlToVideo.createAndWaitForVideoFromLink({
        link: linkResponse.id,
        visual_style: 'ModernProductShowcase',
        script_style: 'ProfessionalWriter',
        aspect_ratio: '9:16', // Vertical format
        video_length: 15,
        language: 'en',
        target_audience: 'tech enthusiasts',
        target_platform: 'Tiktok',
      });
      
      resourceTracker.addTask(completedVideo.id, 'url-video');
      
      expect(completedVideo.status).toBe('done');
      expect(completedVideo).toHaveProperty('output');
      expect(completedVideo.output).toMatch(/^https?:\/\//);
      
      // Download and validate
      const filename = generateUniqueFilename('url-video-convenience', 'mp4');
      const outputPath = join(config.outputDir, filename);
      
      await downloadFile(completedVideo.output, outputPath);
      resourceTracker.addFile(outputPath);
      
      const fileSize = await getFileSize(outputPath);
      expect(fileSize).toBeGreaterThan(0);
      
      const mediaInfo = await getMediaInfo(outputPath);
      expect(mediaInfo.duration).toBeGreaterThan(0);
      expect(mediaInfo.hasVideo).toBe(true);
      expect(mediaInfo.hasAudio).toBe(true);
      
      // Verify vertical aspect ratio (9:16)
      expect(mediaInfo.height).toBeGreaterThan(mediaInfo.width);
      
      console.log(`Convenience method video: ${mediaInfo.duration}s, ${mediaInfo.width}x${mediaInfo.height}`);
    }, 600000); // 10 minute timeout
  });

  describe('Video Management', () => {
    it('should list all videos from links', async () => {
      const videos = await creatify.urlToVideo.getVideosFromLink();
      
      expect(videos).toBeInstanceOf(Array);
      // Should have at least the videos we created in previous tests
      expect(videos.length).toBeGreaterThan(0);
      
      const video = videos[0];
      expect(video).toHaveProperty('id');
      expect(video).toHaveProperty('status');
      expect(typeof video.id).toBe('string');
      expect(typeof video.status).toBe('string');
      
      console.log(`Found ${videos.length} URL-to-Video tasks in account`);
    });

    it('should get specific video by ID', async () => {
      // Get the list of videos to find an existing one
      const videos = await creatify.urlToVideo.getVideosFromLink();
      expect(videos.length).toBeGreaterThan(0);
      
      const videoId = videos[0].id;
      
      // Get the specific video
      const retrievedVideo = await creatify.urlToVideo.getVideoFromLink(videoId);
      
      expect(retrievedVideo).toHaveProperty('id');
      expect(retrievedVideo.id).toBe(videoId);
      expect(retrievedVideo).toHaveProperty('status');
      expect(retrievedVideo).toHaveProperty('link');
      
      console.log(`Retrieved video: ${retrievedVideo.id}, status: ${retrievedVideo.status}`);
    });
  });

  describe('Link Updates', () => {
    it('should update link with custom parameters', async () => {
      const testUrl = TEST_CONTENT.URLS[2];
      
      // Create a link
      const linkResponse = await creatify.urlToVideo.createLink({
        url: testUrl,
      });
      
      resourceTracker.addTask(linkResponse.id, 'link');
      
      // Update the link with custom parameters
      const updateData = {
        title: 'Custom Integration Test Title',
        description: 'This is a custom description for integration testing.',
        price: '$99.99',
        features: ['Feature 1', 'Feature 2', 'Integration Test Feature'],
      };
      
      const updatedLink = await creatify.urlToVideo.updateLink(linkResponse.id, updateData);
      
      expect(updatedLink).toHaveProperty('id');
      expect(updatedLink.id).toBe(linkResponse.id);
      expect(updatedLink).toHaveProperty('title');
      expect(updatedLink.title).toBe(updateData.title);
      
      console.log(`Updated link: ${updatedLink.id}, title: ${updatedLink.title}`);
    });
  });
});
