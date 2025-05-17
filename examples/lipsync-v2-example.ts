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
 * This example demonstrates how to use the Lipsync v2 API to create a video with multiple avatars.
 * It includes the following steps:
 * 1. Get available avatars
 * 2. Get available voices
 * 3. Create a lipsync v2 task
 * 4. Generate a preview (optional)
 * 5. Render the video (optional)
 * 6. Poll for completion
 * 7. Get the final MP4 video URL
 */
async function createLipsyncV2Video() {
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
    console.log(`Selected first avatar: ${firstAvatar.creator_name} (ID: ${firstAvatar.avatar_id || firstAvatar.id})`);
    console.log(`Selected second avatar: ${secondAvatar.creator_name} (ID: ${secondAvatar.avatar_id || secondAvatar.id})`);
    
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
    const firstScript = "Hi! I'm demonstrating the Lipsync v2 API from the Creatify TypeScript library.";
    const secondScript = "That's right! The Lipsync v2 API allows creating multi-avatar videos with just a few lines of code.";
    
    // Background image (you can replace this with your own URL)
    const backgroundUrl = "https://example.com/your-background.jpg";
    
    console.log('Creating Lipsync v2 video with the following parameters:');
    console.log(`- First avatar: ${firstAvatar.creator_name} saying "${firstScript}"`);
    console.log(`- Second avatar: ${secondAvatar.creator_name} saying "${secondScript}"`);
    console.log(`- Aspect ratio: 16:9`);
    
    // Create the lipsync v2 video
    console.log('Creating Lipsync v2 task...');
    const lipsyncV2Response = await creatify.lipsyncV2.createLipsyncV2({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: firstAvatar.avatar_id || firstAvatar.id,
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
            avatar_id: secondAvatar.avatar_id || secondAvatar.id,
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
    
    console.log('Lipsync v2 task created successfully:');
    console.log(`- Task ID: ${lipsyncV2Response.id}`);
    console.log(`- Initial status: ${lipsyncV2Response.status}`);
    
    // Optional: Generate a preview (lower quality but faster)
    const generatePreview = false; // Set to true to generate a preview
    if (generatePreview) {
      console.log('Generating preview...');
      const previewResponse = await creatify.lipsyncV2.generateLipsyncV2Preview(lipsyncV2Response.id);
      console.log(`Preview generation requested: ${previewResponse.id}`);
    }
    
    // Optional: Render the full video
    const renderVideo = false; // Set to true to explicitly render the video
    if (renderVideo) {
      console.log('Rendering video...');
      const renderResponse = await creatify.lipsyncV2.renderLipsyncV2(lipsyncV2Response.id);
      console.log(`Video rendering requested: ${renderResponse.id}`);
    }
    
    // Poll for completion
    console.log('Polling for completion...');
    let result = await creatify.lipsyncV2.getLipsyncV2(lipsyncV2Response.id);
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
      result = await creatify.lipsyncV2.getLipsyncV2(lipsyncV2Response.id);
      console.log(`Current status: ${result.status}, Progress: ${result.progress || 'N/A'}`);
      attempts++;
    }
    
    // Check final result
    if (result.status === 'done') {
      console.log('Lipsync v2 video generation completed successfully!');
      console.log(`MP4 video URL: ${result.output}`);
      console.log(`Video thumbnail: ${result.video_thumbnail || 'N/A'}`);
      console.log(`Credits used: ${result.credits_used || 'N/A'}`);
      
      // You can now use this URL to download or display the video
      console.log('You can download this MP4 video or embed it in your application.');
      return result.output;
    } else {
      console.error('Video generation failed or timed out.');
      console.error('Error details:', result.error_message || 'No error details available');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while creating the lipsync v2 video:', error);
    return null;
  }
}

// Alternative: Use the convenience method to create and wait for completion
async function createAndWaitForLipsyncV2() {
  try {
    console.log('Getting available avatars...');
    const avatars = await creatify.avatar.getAvatars();
    const voices = await creatify.avatar.getVoices();
    
    // Background image (you can replace this with your own URL)
    const backgroundUrl = "https://example.com/your-background.jpg";
    
    console.log('Creating and waiting for Lipsync v2 video completion...');
    const result = await creatify.lipsyncV2.createAndWaitForLipsyncV2({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: avatars[0].avatar_id || avatars[0].id,
            avatar_style: "normal"
          },
          voice: {
            type: "text",
            input_text: "This is a test of the createAndWaitForLipsyncV2 method.",
            voice_id: voices[0].voice_id
          },
          background: {
            type: "image",
            url: backgroundUrl
          }
        }
      ],
      aspect_ratio: "16:9"
    }, 
    3000,  // Poll every 3 seconds
    40     // Maximum 40 attempts (2 minutes)
    );
    
    if (result.status === 'done') {
      console.log('Video created successfully!');
      console.log(`MP4 URL: ${result.output}`);
      return result.output;
    } else {
      console.error('Video creation failed:', result.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error creating video:', error);
    return null;
  }
}

// Run the example - choose which method to use
const useConvenienceMethod = false; // Set to true to use createAndWaitForLipsyncV2

if (useConvenienceMethod) {
  createAndWaitForLipsyncV2().then(videoUrl => {
    if (videoUrl) {
      console.log('Example completed successfully with convenience method.');
    } else {
      console.log('Example failed to generate a video with convenience method.');
    }
  });
} else {
  createLipsyncV2Video().then(videoUrl => {
    if (videoUrl) {
      console.log('Example completed successfully with standard method.');
    } else {
      console.log('Example failed to generate a video with standard method.');
    }
  });
}
