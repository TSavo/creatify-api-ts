#!/usr/bin/env node

const { VideoCreator } = require('../dist').utils;

// Get command line arguments
const args = process.argv.slice(2);

// Check if API credentials are provided
if (args.length < 3) {
  console.error('Usage: node create-video.js <API_ID> <API_KEY> "<SCRIPT>" [AVATAR_NAME] [VOICE_NAME]');
  console.error('Example: node create-video.js my-api-id my-api-key "Hello world!" "John" "English Male"');
  process.exit(1);
}

// Parse command line arguments
const apiId = args[0];
const apiKey = args[1];
const script = args[2];
const avatarName = args[3] || undefined;
const voiceName = args[4] || undefined;

// Create a video with the provided script
async function createVideo() {
  try {
    // Create a new VideoCreator instance
    const videoCreator = new VideoCreator(apiId, apiKey);
    
    console.log('Creating a video with the following parameters:');
    console.log(`- Script: "${script}"`);
    if (avatarName) console.log(`- Avatar Name: ${avatarName}`);
    if (voiceName) console.log(`- Voice Name: ${voiceName}`);
    
    // Create the video
    console.log('\nCreating video...');
    const videoResult = await videoCreator.createVideo({
      script,
      avatarName,
      voiceName,
      aspectRatio: "16:9",
      pollInterval: 5000,
      maxPollingAttempts: 60
    });
    
    console.log('\nVideo created successfully!');
    console.log(`MP4 video URL: ${videoResult.url}`);
    console.log('\nYou can download this MP4 video or embed it in your application.');
    
    return videoResult.url;
  } catch (error) {
    console.error('\nError creating video:', error.message || error);
    process.exit(1);
  }
}

// Run the script
createVideo();