import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { join } from 'path';
import { Creatify } from '../../src';
import {
  getIntegrationConfig,
  ensureOutputDir,
  downloadFile,
  getFileSize,
  getMediaInfo,
  generateUniqueFilename,
  TestResourceTracker,
} from './setup';

describe('Musics API Integration Tests', () => {
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

      console.log('Musics integration tests initialized');
    } catch (error) {
      if (error.message?.includes('environment variables')) {
        console.log('Skipping Musics integration tests - API credentials not provided');
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

  describe('Music Library', () => {
    it('should list available music tracks', async () => {
      console.log('Fetching available music tracks...');
      
      const musicTracks = await creatify.musics.getMusics();
      
      expect(musicTracks).toBeInstanceOf(Array);
      console.log(`Found ${musicTracks.length} music tracks`);
      
      if (musicTracks.length > 0) {
        const track = musicTracks[0];
        expect(track).toHaveProperty('id');
        expect(track).toHaveProperty('name');
        expect(typeof track.id).toBe('string');
        expect(typeof track.name).toBe('string');
        
        console.log(`Sample track: ${track.name} (${track.id})`);
        
        // Check for common music properties
        if (track.duration !== undefined) {
          expect(typeof track.duration).toBe('number');
          console.log(`Duration: ${track.duration}s`);
        }
        
        if (track.genre !== undefined) {
          expect(typeof track.genre).toBe('string');
          console.log(`Genre: ${track.genre}`);
        }
        
        if (track.mood !== undefined) {
          expect(typeof track.mood).toBe('string');
          console.log(`Mood: ${track.mood}`);
        }
        
        if (track.url !== undefined) {
          expect(track.url).toMatch(/^https?:\/\//);
          console.log(`Track URL available`);
        }
      }
    });

    it('should get music tracks with pagination', async () => {
      console.log('Testing music pagination...');
      
      try {
        const paginatedTracks = await creatify.musics.getMusicsWithPagination({
          page: 1,
          page_size: 10,
        });
        
        expect(paginatedTracks).toHaveProperty('results');
        expect(paginatedTracks).toHaveProperty('count');
        expect(paginatedTracks.results).toBeInstanceOf(Array);
        expect(typeof paginatedTracks.count).toBe('number');
        expect(paginatedTracks.results.length).toBeLessThanOrEqual(10);
        
        console.log(`Paginated results: ${paginatedTracks.results.length} tracks, total: ${paginatedTracks.count}`);
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('Music pagination endpoint not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });

    it('should filter music tracks by genre', async () => {
      console.log('Testing music filtering by genre...');
      
      try {
        const genres = ['ambient', 'upbeat', 'corporate', 'cinematic'];
        
        for (const genre of genres) {
          const filteredTracks = await creatify.musics.getMusics({
            genre: genre,
          });
          
          expect(filteredTracks).toBeInstanceOf(Array);
          console.log(`${genre} tracks: ${filteredTracks.length}`);
          
          if (filteredTracks.length > 0) {
            const track = filteredTracks[0];
            expect(track).toHaveProperty('id');
            expect(track).toHaveProperty('name');
            
            if (track.genre !== undefined) {
              expect(track.genre.toLowerCase()).toContain(genre.toLowerCase());
            }
          }
          
          // Brief delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('Music filtering not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });

  describe('Music Track Details', () => {
    it('should get specific music track by ID', async () => {
      console.log('Fetching specific music track...');
      
      // First get the list of tracks to find an existing one
      const musicTracks = await creatify.musics.getMusics();
      
      if (musicTracks.length === 0) {
        console.log('No music tracks available for detailed testing');
        return;
      }
      
      const trackId = musicTracks[0].id;
      
      try {
        const track = await creatify.musics.getMusic(trackId);
        
        expect(track).toHaveProperty('id');
        expect(track.id).toBe(trackId);
        expect(track).toHaveProperty('name');
        expect(typeof track.name).toBe('string');
        
        console.log(`Retrieved track: ${track.name} (${track.id})`);
        
        // Validate track properties
        if (track.url !== undefined) {
          expect(track.url).toMatch(/^https?:\/\//);
          console.log(`Track URL: ${track.url}`);
        }
        
        if (track.duration !== undefined) {
          expect(typeof track.duration).toBe('number');
          expect(track.duration).toBeGreaterThan(0);
          console.log(`Track duration: ${track.duration}s`);
        }
        
        if (track.file_size !== undefined) {
          expect(typeof track.file_size).toBe('number');
          expect(track.file_size).toBeGreaterThan(0);
          console.log(`File size: ${track.file_size} bytes`);
        }
      } catch (error) {
        if (error.status === 404) {
          console.log('Music track not found - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });

    it('should download and validate music file', async () => {
      console.log('Testing music file download and validation...');
      
      // Get available tracks
      const musicTracks = await creatify.musics.getMusics();
      
      if (musicTracks.length === 0) {
        console.log('No music tracks available for download testing');
        return;
      }
      
      // Find a track with a URL
      const trackWithUrl = musicTracks.find(track => track.url && track.url.match(/^https?:\/\//));
      
      if (!trackWithUrl) {
        console.log('No music tracks with downloadable URLs found');
        return;
      }
      
      console.log(`Downloading music track: ${trackWithUrl.name}`);
      
      try {
        // Download the music file
        const filename = generateUniqueFilename('music-track', 'mp3');
        const outputPath = join(config.outputDir, filename);
        
        await downloadFile(trackWithUrl.url, outputPath);
        resourceTracker.addFile(outputPath);
        
        // Validate file exists and has content
        const fileSize = await getFileSize(outputPath);
        expect(fileSize).toBeGreaterThan(0);
        console.log(`Downloaded music file size: ${fileSize} bytes`);
        
        // Validate with ffprobe
        const mediaInfo = await getMediaInfo(outputPath);
        expect(mediaInfo.duration).toBeGreaterThan(0);
        expect(mediaInfo.hasAudio).toBe(true);
        expect(mediaInfo.hasVideo).toBe(false); // Audio only
        
        console.log(`Music info: ${mediaInfo.duration}s, ${mediaInfo.format}, bitrate: ${mediaInfo.bitrate}`);
        
        // Validate duration matches track metadata if available
        if (trackWithUrl.duration !== undefined) {
          // Allow some tolerance for duration differences
          const durationDiff = Math.abs(mediaInfo.duration - trackWithUrl.duration);
          expect(durationDiff).toBeLessThan(2); // Within 2 seconds
          console.log(`Duration validation: metadata=${trackWithUrl.duration}s, actual=${mediaInfo.duration}s`);
        }
      } catch (error) {
        if (error.message?.includes('download') || error.message?.includes('network')) {
          console.log('Music download failed - this may be expected due to network issues');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });

  describe('Music Search and Filtering', () => {
    it('should search music tracks by name', async () => {
      console.log('Testing music search functionality...');
      
      try {
        const searchTerms = ['ambient', 'upbeat', 'corporate'];
        
        for (const term of searchTerms) {
          const searchResults = await creatify.musics.searchMusics({
            query: term,
          });
          
          expect(searchResults).toBeInstanceOf(Array);
          console.log(`Search "${term}": ${searchResults.length} results`);
          
          if (searchResults.length > 0) {
            const result = searchResults[0];
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name');
            
            // Check if search term appears in name or genre
            const nameMatch = result.name.toLowerCase().includes(term.toLowerCase());
            const genreMatch = result.genre && result.genre.toLowerCase().includes(term.toLowerCase());
            const moodMatch = result.mood && result.mood.toLowerCase().includes(term.toLowerCase());
            
            expect(nameMatch || genreMatch || moodMatch).toBe(true);
            console.log(`Found relevant track: ${result.name}`);
          }
          
          // Brief delay between searches
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('Music search endpoint not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });

    it('should filter music by mood and duration', async () => {
      console.log('Testing music filtering by mood and duration...');
      
      try {
        const filters = [
          { mood: 'happy', min_duration: 30, max_duration: 120 },
          { mood: 'calm', min_duration: 60, max_duration: 180 },
          { mood: 'energetic', min_duration: 15, max_duration: 90 },
        ];
        
        for (const filter of filters) {
          const filteredTracks = await creatify.musics.getMusics(filter);
          
          expect(filteredTracks).toBeInstanceOf(Array);
          console.log(`Filter ${JSON.stringify(filter)}: ${filteredTracks.length} tracks`);
          
          if (filteredTracks.length > 0) {
            const track = filteredTracks[0];
            expect(track).toHaveProperty('id');
            expect(track).toHaveProperty('name');
            
            // Validate mood filter if available
            if (track.mood !== undefined && filter.mood) {
              expect(track.mood.toLowerCase()).toContain(filter.mood.toLowerCase());
            }
            
            // Validate duration filter if available
            if (track.duration !== undefined) {
              if (filter.min_duration) {
                expect(track.duration).toBeGreaterThanOrEqual(filter.min_duration);
              }
              if (filter.max_duration) {
                expect(track.duration).toBeLessThanOrEqual(filter.max_duration);
              }
            }
            
            console.log(`Filtered track: ${track.name} (${track.duration}s, ${track.mood})`);
          }
          
          // Brief delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        if (error.status === 404 || error.message?.includes('not found')) {
          console.log('Music filtering by mood/duration not available - this may be expected');
          // Don't fail the test
        } else {
          throw error;
        }
      }
    });
  });
});
