import { Creatify } from '../src';

// Replace with your actual API credentials
const apiId = 'your-api-id';
const apiKey = 'your-api-key';

// Initialize the client
const creatify = new Creatify({
  apiId,
  apiKey,
});

// Example: Get available avatars
async function getAvatars() {
  try {
    const avatars = await creatify.avatar.getAvatars();
    console.log('Available avatars:', avatars);
    return avatars;
  } catch (error) {
    console.error('Failed to get avatars:', error);
    return null;
  }
}

// Example: Create a lipsync video
async function createLipsyncVideo(avatarId: string, voiceId: string) {
  try {
    // Create a lipsync video
    const lipsyncResponse = await creatify.avatar.createLipsync({
      text: "Hello, this is a test of the Creatify AI Avatar API!",
      creator: avatarId,
      aspect_ratio: "16:9",
      voice_id: voiceId,
    });
    
    console.log('Lipsync task created:', lipsyncResponse);
    
    // Poll for completion
    let lipsyncResult = await creatify.avatar.getLipsync(lipsyncResponse.id);
    console.log('Initial status:', lipsyncResult.status);
    
    // Simple polling loop
    while (lipsyncResult.status !== 'done' && lipsyncResult.status !== 'error') {
      // Wait for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check status again
      lipsyncResult = await creatify.avatar.getLipsync(lipsyncResponse.id);
      console.log('Updated status:', lipsyncResult.status);
    }
    
    if (lipsyncResult.status === 'done') {
      console.log('Video ready at:', lipsyncResult.output);
    } else {
      console.error('Video generation failed:', lipsyncResult.error_message);
    }
    
    return lipsyncResult;
  } catch (error) {
    console.error('Failed to create lipsync video:', error);
    return null;
  }
}

// Example: Convert a URL to a video
async function createUrlToVideo(url: string) {
  try {
    // Create a link from a URL
    console.log('Creating link from URL:', url);
    const linkResponse = await creatify.urlToVideo.createLink({
      url: url
    });
    
    console.log('Link created:', linkResponse);
    
    // Generate a video from the link
    console.log('Generating video from link...');
    const videoResponse = await creatify.urlToVideo.createVideoFromLink({
      link: linkResponse.id,
      visual_style: "DynamicProductTemplate",
      script_style: "EnthusiasticWriter",
      aspect_ratio: "9:16",
      video_length: 30,
      language: "en",
      target_audience: "tech enthusiasts",
      target_platform: "Tiktok"
    });
    
    console.log('Video task created:', videoResponse);
    
    // Poll for completion
    let videoResult = await creatify.urlToVideo.getVideo(videoResponse.id);
    console.log('Initial status:', videoResult.status);
    
    // Simple polling loop
    while (videoResult.status !== 'done' && videoResult.status !== 'error') {
      // Wait for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Check status again
      videoResult = await creatify.urlToVideo.getVideo(videoResponse.id);
      console.log('Updated status:', videoResult.status);
    }
    
    if (videoResult.status === 'done') {
      console.log('Video ready at:', videoResult.output);
    } else {
      console.error('Video generation failed:', videoResult.error_message);
    }
    
    return videoResult;
  } catch (error) {
    console.error('Failed to create URL-to-Video:', error);
    return null;
  }
}

// Run examples
async function runExamples() {
  // Comment/uncomment examples as needed
  
  // Get avatars
  const avatars = await getAvatars();
  
  // If you have avatars and want to test lipsync, uncomment this:
  /*
  if (avatars && avatars.length > 0) {
    // Use the first avatar for the example
    const avatarId = avatars[0].avatar_id;
    
    // You'll need to replace this with a valid voice ID
    const voiceId = 'your-voice-id';
    
    await createLipsyncVideo(avatarId, voiceId);
  }
  */
  
  // Test URL-to-Video
  // await createUrlToVideo('https://example.com');
}

// Run the examples
runExamples().catch(error => {
  console.error('Error in examples:', error);
});