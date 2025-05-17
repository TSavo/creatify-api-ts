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
 * This example demonstrates how to create an MP4 video with multiple avatars having a conversation.
 * It shows a more advanced use case of the API with the following steps:
 * 1. Get available avatars
 * 2. Get available voices
 * 3. Create a multi-avatar lipsync video with chosen avatars and voices
 * 4. Poll for completion
 * 5. Get the final MP4 video URL
 */
async function createMultiAvatarConversation() {
  try {
    console.log('Getting available avatars...');
    const avatars = await creatify.avatar.getAvatars();
    
    if (!avatars || avatars.length < 2) {
      console.error('Not enough avatars available. You need at least 2 avatars for this example.');
      return;
    }
    
    // Choose two different avatars
    const firstAvatar = avatars[0];
    const secondAvatar = avatars[1];
    console.log(`Selected first avatar: ${firstAvatar.name} (ID: ${firstAvatar.avatar_id})`);
    console.log(`Selected second avatar: ${secondAvatar.name} (ID: ${secondAvatar.avatar_id})`);
    
    // Get available voices
    console.log('Getting available voices...');
    const voices = await creatify.avatar.getVoices();
    
    if (!voices || voices.length < 2) {
      console.error('Not enough voices available. You need at least 2 voices for this example.');
      return;
    }
    
    // Choose two different voices
    const firstVoice = voices[0];
    const secondVoice = voices[1];
    console.log(`Selected first voice: ${firstVoice.name} (ID: ${firstVoice.voice_id})`);
    console.log(`Selected second voice: ${secondVoice.name} (ID: ${secondVoice.voice_id})`);
    
    // Scripts for each avatar
    const firstScript = "Hey there! Have you heard about this new TypeScript library for Creatify's API?";
    const secondScript = "Yes, I have! It makes it super easy to create AI avatar videos with just a few lines of code. You can even create multi-avatar conversations like this one!";
    
    // Background image (you can replace this with your own URL)
    const backgroundUrl = "https://example.com/your-background.jpg";
    
    console.log('Creating multi-avatar conversation with the following parameters:');
    console.log(`- First avatar: ${firstAvatar.name} saying "${firstScript}"`);
    console.log(`- Second avatar: ${secondAvatar.name} saying "${secondScript}"`);
    console.log(`- Aspect ratio: 16:9`);
    
    // Create the multi-avatar lipsync video
    const multiAvatarResponse = await creatify.avatar.createMultiAvatarLipsync({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: firstAvatar.avatar_id,
            avatar_style: "normal",
            offset: { x: -0.23, y: 0.35 }
          },
          voice: {
            type: "text",
            input_text: firstScript,
            voice_id: firstVoice.voice_id
          },
          background: {
            type: "image",
            url: backgroundUrl
          },
          caption_setting: {
            style: "normal-black",
            offset: { x: 0, y: 0.45 }
          }
        },
        {
          character: {
            type: "avatar",
            avatar_id: secondAvatar.avatar_id,
            avatar_style: "normal",
            offset: { x: -0.23, y: 0.35 }
          },
          voice: {
            type: "text",
            input_text: secondScript,
            voice_id: secondVoice.voice_id
          },
          background: {
            type: "image",
            url: backgroundUrl
          },
          caption_setting: {
            style: "normal-black",
            offset: { x: 0, y: 0.45 }
          }
        }
      ],
      aspect_ratio: "16:9"
    });
    
    console.log('Multi-avatar task created successfully:');
    console.log(`- Task ID: ${multiAvatarResponse.id}`);
    console.log(`- Initial status: ${multiAvatarResponse.status}`);
    
    // Poll for completion
    console.log('Polling for completion...');
    let result = await creatify.avatar.getLipsync(multiAvatarResponse.id);
    console.log(`Current status: ${result.status}`);
    
    // Simple polling loop with timeout
    const maxAttempts = 30; // Maximum polling attempts
    let attempts = 0;
    
    while (
      result.status !== 'done' && 
      result.status !== 'error' && 
      attempts < maxAttempts
    ) {
      // Wait for 5 seconds between checks
      console.log('Waiting 5 seconds before checking again...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check status again
      result = await creatify.avatar.getLipsync(multiAvatarResponse.id);
      console.log(`Current status: ${result.status}`);
      attempts++;
    }
    
    // Check final result
    if (result.status === 'done') {
      console.log('Multi-avatar video generation completed successfully!');
      console.log(`MP4 video URL: ${result.output}`);
      
      // You can now use this URL to download or display the video
      console.log('You can download this MP4 video or embed it in your application.');
      return result.output;
    } else {
      console.error('Video generation failed or timed out.');
      console.error('Error details:', result.error_message || 'No error details available');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while creating the multi-avatar video:', error);
    return null;
  }
}

// Run the example
createMultiAvatarConversation().then(videoUrl => {
  if (videoUrl) {
    console.log('Example completed successfully. Final video URL:', videoUrl);
  } else {
    console.log('Example failed to generate a video.');
  }
});