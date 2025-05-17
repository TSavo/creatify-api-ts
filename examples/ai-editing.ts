import { Creatify } from '../src';

/**
 * Example: AI Editing API
 * 
 * This example demonstrates how to use the Creatify API to edit videos with AI.
 * 
 * To run this example:
 * 1. Build the library: npm run build
 * 2. Run with your API credentials: 
 *    npx ts-node examples/ai-editing.ts YOUR_API_ID YOUR_API_KEY VIDEO_URL
 */

// Get API credentials and video URL from command line arguments
const apiId = process.argv[2];
const apiKey = process.argv[3];
const videoUrl = process.argv[4];

if (!apiId || !apiKey || !videoUrl) {
  console.error('Please provide your API ID, API Key, and a video URL as command line arguments');
  console.error('Example: npx ts-node examples/ai-editing.ts YOUR_API_ID YOUR_API_KEY https://example.com/video.mp4');
  process.exit(1);
}

// Initialize the Creatify API client
const creatify = new Creatify({
  apiId,
  apiKey
});

async function main() {
  try {
    console.log(`Submitting video for AI editing: ${videoUrl}`);
    
    // Create an AI editing task with the 'film' style
    const response = await creatify.aiEditing.createAiEditing({
      video_url: videoUrl,
      editing_style: 'film'
    });
    
    console.log(`AI editing task created successfully. Task ID: ${response.id}`);
    console.log('Polling for task completion (this may take several minutes)...');
    
    // Poll for completion
    let result = await creatify.aiEditing.getAiEditing(response.id);
    let dots = 0;
    
    while (result.status !== 'done' && result.status !== 'error') {
      const progressBar = '.'.repeat(dots);
      console.log(`Current status: ${result.status} ${progressBar}`);
      dots = (dots + 1) % 10;
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      result = await creatify.aiEditing.getAiEditing(response.id);
    }
    
    // Check final status
    if (result.status === 'error') {
      console.error(`Error in AI editing task: ${result.error_message}`);
    } else {
      console.log(`AI editing task completed successfully!`);
      console.log(`Edited video URL: ${result.output}`);
      console.log(`You can download or play the edited video from the URL above.`);
    }
    
    // Example of using the convenience method
    console.log('\nNow using the convenience method to create another AI editing task...');
    console.log('Note: This method may take several minutes, as it waits for completion');
    
    try {
      const result2 = await creatify.aiEditing.createAndWaitForAiEditing({
        video_url: videoUrl,
        editing_style: 'commercial'
      }, 10000, 30); // Poll every 10 seconds, max 30 attempts (5 minutes)
      
      console.log(`Convenience method completed with status: ${result2.status}`);
      if (result2.status === 'done') {
        console.log(`Edited video URL: ${result2.output}`);
      } else if (result2.status === 'error') {
        console.error(`Error in AI editing task: ${result2.error_message}`);
      } else {
        console.log('Editing task is still processing. You can check the status later with the task ID.');
      }
    } catch (error) {
      console.error('Timeout or error waiting for AI editing completion:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
