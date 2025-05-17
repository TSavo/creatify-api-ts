import { Creatify } from '../src';

// Replace with your actual API credentials
const apiId = 'your-api-id';
const apiKey = 'your-api-key';

// Initialize the client
const creatify = new Creatify({
  apiId,
  apiKey,
});

/**
 * This example demonstrates how to create an MP4 video with an avatar speaking a script.
 * It follows these steps:
 * 1. Get available avatars
 * 2. Get available voices
 * 3. Create a lipsync video with the chosen avatar and voice
 * 4. Poll for completion
 * 5. Get the final MP4 video URL
 */
async function createAvatarVideoWithScript() {
  try {
    console.log('Getting available avatars...');
    const avatars = await creatify.avatar.getAvatars();
    
    if (!avatars || avatars.length === 0) {
      console.error('No avatars available. Please check your API credentials.');
      return;
    }
    
    // Log first few avatars for reference
    console.log(`Found ${avatars.length} avatars. First few:`);
    avatars.slice(0, 3).forEach(avatar => {
      console.log(`- ${avatar.name} (ID: ${avatar.avatar_id})`);
    });
    
    // Choose an avatar (using the first one for this example)
    const selectedAvatar = avatars[0];
    console.log(`Selected avatar: ${selectedAvatar.name} (ID: ${selectedAvatar.avatar_id})`);
    
    // Get available voices
    console.log('Getting available voices...');
    const voices = await creatify.avatar.getVoices();
    
    if (!voices || voices.length === 0) {
      console.error('No voices available. Please check your API credentials.');
      return;
    }
    
    // Log first few voices for reference
    console.log(`Found ${voices.length} voices. First few:`);
    voices.slice(0, 3).forEach(voice => {
      console.log(`- ${voice.name} (ID: ${voice.voice_id})`);
    });
    
    // Choose a voice (using the first one for this example)
    const selectedVoice = voices[0];
    console.log(`Selected voice: ${selectedVoice.name} (ID: ${selectedVoice.voice_id})`);
    
    // The script for the avatar to speak
    const script = "Hello! This is a test of the Creatify API. I'm an AI avatar created with the Creatify TypeScript library. This video was generated programmatically and can be customized with different avatars, voices, and scripts.";
    
    console.log('Creating lipsync video with the following parameters:');
    console.log(`- Avatar: ${selectedAvatar.name}`);
    console.log(`- Voice: ${selectedVoice.name}`);
    console.log(`- Script: "${script.substring(0, 50)}..."`);
    console.log(`- Aspect ratio: 16:9`);
    
    // Create the lipsync video
    const lipsyncResponse = await creatify.avatar.createLipsync({
      text: script,
      creator: selectedAvatar.avatar_id,
      aspect_ratio: "16:9",
      voice_id: selectedVoice.voice_id,
    });
    
    console.log('Lipsync task created successfully:');
    console.log(`- Task ID: ${lipsyncResponse.id}`);
    console.log(`- Initial status: ${lipsyncResponse.status}`);
    
    // Poll for completion
    console.log('Polling for completion...');
    let lipsyncResult = await creatify.avatar.getLipsync(lipsyncResponse.id);
    console.log(`Current status: ${lipsyncResult.status}`);
    
    // Simple polling loop with timeout
    const maxAttempts = 30; // Maximum polling attempts
    let attempts = 0;
    
    while (
      lipsyncResult.status !== 'done' && 
      lipsyncResult.status !== 'error' && 
      attempts < maxAttempts
    ) {
      // Wait for 5 seconds between checks
      console.log('Waiting 5 seconds before checking again...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check status again
      lipsyncResult = await creatify.avatar.getLipsync(lipsyncResponse.id);
      console.log(`Current status: ${lipsyncResult.status}`);
      attempts++;
    }
    
    // Check final result
    if (lipsyncResult.status === 'done') {
      console.log('Video generation completed successfully!');
      console.log(`MP4 video URL: ${lipsyncResult.output}`);
      
      // You can now use this URL to download or display the video
      console.log('You can download this MP4 video or embed it in your application.');
      return lipsyncResult.output;
    } else {
      console.error('Video generation failed or timed out.');
      console.error('Error details:', lipsyncResult.error_message || 'No error details available');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while creating the avatar video:', error);
    return null;
  }
}

// Run the example
createAvatarVideoWithScript().then(videoUrl => {
  if (videoUrl) {
    console.log('Example completed successfully. Final video URL:', videoUrl);
  } else {
    console.log('Example failed to generate a video.');
  }
});