import { Creatify } from '../src';

/**
 * Example: Text-to-Speech API
 * 
 * This example demonstrates how to use the Creatify API to convert text to speech.
 * 
 * To run this example:
 * 1. Build the library: npm run build
 * 2. Run with your API credentials: 
 *    npx ts-node examples/text-to-speech.ts YOUR_API_ID YOUR_API_KEY
 */

// Get API credentials from command line arguments
const apiId = process.argv[2];
const apiKey = process.argv[3];

if (!apiId || !apiKey) {
  console.error('Please provide your API ID and API Key as command line arguments');
  console.error('Example: npx ts-node examples/text-to-speech.ts YOUR_API_ID YOUR_API_KEY');
  process.exit(1);
}

// Initialize the Creatify API client
const creatify = new Creatify({
  apiId,
  apiKey
});

async function main() {
  try {
    console.log('Fetching available voices...');
    
    // Get a list of available voices/accents
    const voices = await creatify.avatar.getVoices();
    console.log(`Found ${voices.length} available voices`);
    
    // Choose a voice (using the first English voice, or the first voice if no English voices are found)
    const voice = voices.find(v => v.language === 'en') || voices[0];
    console.log(`Using voice: ${voice.name} (${voice.voice_id})`);
    
    // Create a simple text-to-speech request
    const text = 'Hello! This is a test of the Creatify Text-to-Speech API. It can convert text to natural-sounding speech in various accents and languages.';
    console.log(`Creating text-to-speech task with text: "${text}"`);
    
    // Start the text-to-speech task
    const response = await creatify.textToSpeech.createTextToSpeech({
      script: text,
      accent: voice.voice_id
    });
    
    console.log(`Text-to-speech task created successfully. Task ID: ${response.id}`);
    console.log('Polling for task completion...');
    
    // Poll for completion
    let result = await creatify.textToSpeech.getTextToSpeech(response.id);
    while (result.status !== 'done' && result.status !== 'error') {
      console.log(`Current status: ${result.status}, waiting...`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      result = await creatify.textToSpeech.getTextToSpeech(response.id);
    }
    
    // Check final status
    if (result.status === 'error') {
      console.error(`Error in text-to-speech task: ${result.error_message}`);
    } else {
      console.log(`Text-to-speech task completed successfully!`);
      console.log(`Audio URL: ${result.output}`);
      console.log(`You can download or play the audio from the URL above.`);
    }
    
    // Example of using the convenience method
    console.log('\nNow using the convenience method to create another text-to-speech...');
    const text2 = 'This is another example using the convenience method that automatically polls for completion.';
    
    const result2 = await creatify.textToSpeech.createAndWaitForTextToSpeech({
      script: text2,
      accent: voice.voice_id
    });
    
    console.log(`Convenience method completed with status: ${result2.status}`);
    if (result2.status === 'done') {
      console.log(`Audio URL: ${result2.output}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
