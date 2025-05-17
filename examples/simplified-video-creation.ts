import { VideoCreator } from '../src/utils';

// Replace with your actual API credentials
const apiId = 'your-api-id';
const apiKey = 'your-api-key';

/**
 * This example demonstrates the simplified workflow for creating MP4 videos with avatars
 * using the VideoCreator utility.
 */
async function simplifiedExample() {
  // Create a new VideoCreator instance
  const videoCreator = new VideoCreator(apiId, apiKey);
  
  // Preload avatars and voices (optional, but makes subsequent calls faster)
  console.log('Preloading avatars and voices...');
  const preloadResult = await videoCreator.preload();
  console.log(`Preloaded ${preloadResult.avatars} avatars and ${preloadResult.voices} voices.`);
  
  try {
    // Example 1: Create a simple video with a single avatar
    console.log('Creating a simple video with a single avatar...');
    const videoResult = await videoCreator.createVideo({
      // You can specify avatar by name (partial match) or ID
      // If not specified, the first available avatar will be used
      // avatarName: 'John',  // Will find any avatar with "John" in the name
      
      // You can specify voice by name (partial match) or ID
      // If not specified, no specific voice will be used (API will choose a default)
      // voiceName: 'English',  // Will find any voice with "English" in the name
      
      // The script for the avatar to speak
      script: "Hello! This is a test video created with the Creatify TypeScript library. You can create videos like this with just a few lines of code!",
      
      // Aspect ratio (optional, defaults to "16:9")
      aspectRatio: "16:9",
      
      // Polling settings (optional)
      pollInterval: 5000,       // Check status every 5 seconds
      maxPollingAttempts: 30    // Try up to 30 times (2.5 minutes)
    });
    
    console.log('Video created successfully!');
    console.log(`MP4 video URL: ${videoResult.url}`);
    
    // Example 2: Create a conversation with multiple avatars
    console.log('\nCreating a conversation with multiple avatars...');
    const conversationResult = await videoCreator.createConversation({
      conversation: [
        {
          // First avatar's segment
          // avatarName: 'Sarah',  // Will find any avatar with "Sarah" in the name
          // voiceName: 'Female',  // Will find any voice with "Female" in the name
          text: "Hi there! Have you heard about the new Creatify API TypeScript library?"
        },
        {
          // Second avatar's segment
          // avatarName: 'Michael',  // Will find any avatar with "Michael" in the name
          // voiceName: 'Male',      // Will find any voice with "Male" in the name
          text: "Yes, I have! It makes it super easy to create AI avatar videos programmatically."
        },
        {
          // Third avatar's segment
          // avatarName: 'Emily',  // Will find any avatar with "Emily" in the name
          // voiceName: 'British', // Will find any voice with "British" in the name
          text: "The best part is that you can create conversations with multiple avatars, just like this one!"
        }
      ],
      // Background image URL (optional)
      // backgroundUrl: "https://example.com/your-background.jpg",
      
      // Aspect ratio (optional, defaults to "16:9")
      aspectRatio: "16:9",
      
      // Polling settings (optional)
      pollInterval: 5000,      // Check status every 5 seconds
      maxPollingAttempts: 60   // Try up to 60 times (5 minutes)
    });
    
    console.log('Conversation video created successfully!');
    console.log(`MP4 video URL: ${conversationResult.url}`);
    
    return {
      singleVideoUrl: videoResult.url,
      conversationVideoUrl: conversationResult.url
    };
  } catch (error) {
    console.error('Error creating videos:', error);
    return null;
  }
}

// Run the example
simplifiedExample().then(result => {
  if (result) {
    console.log('\nExample completed successfully!');
    console.log('Single Avatar Video URL:', result.singleVideoUrl);
    console.log('Conversation Video URL:', result.conversationVideoUrl);
  } else {
    console.log('Example failed.');
  }
});