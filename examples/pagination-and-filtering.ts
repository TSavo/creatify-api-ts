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
 * Example demonstrating pagination and filtering with the Creatify API
 */
async function paginationAndFiltering() {
  try {
    // 1. Get avatars with filtering
    console.log('\n--- Filtering Avatars ---');
    
    // Get adult male avatars
    const adultMaleAvatars = await creatify.avatar.getAvatars({
      age_range: 'adult',
      gender: 'm'
    });
    console.log(`Found ${adultMaleAvatars.length} adult male avatars`);
    
    // Get outdoor presenters
    const outdoorPresenters = await creatify.avatar.getAvatars({
      location: 'outdoor',
      style: 'presenter'
    });
    console.log(`Found ${outdoorPresenters.length} outdoor presenters`);
    
    // 2. Use paginated avatar results
    console.log('\n--- Paginated Avatars ---');
    
    // First page of avatars (5 per page)
    const page1 = await creatify.avatar.getAvatarsPaginated(1, 5);
    console.log(`Total avatars: ${page1.count}`);
    console.log(`Page 1 avatars: ${page1.results.length}`);
    
    // Second page of avatars (if available)
    if (page1.next) {
      const page2 = await creatify.avatar.getAvatarsPaginated(2, 5);
      console.log(`Page 2 avatars: ${page2.results.length}`);
    }
    
    // Filtered paginated results
    const filteredPaginated = await creatify.avatar.getAvatarsPaginated(1, 5, {
      gender: 'f',
      style: 'selfie'
    });
    console.log(`Found ${filteredPaginated.count} total female selfie avatars`);
    console.log(`Page 1 of filtered results: ${filteredPaginated.results.length}`);
    
    // 3. URL-to-Video API pagination
    console.log('\n--- URL-to-Video Pagination ---');
    
    // Get paginated links
    const links = await creatify.urlToVideo.getLinksPaginated(1, 5);
    console.log(`Total links: ${links.count}`);
    console.log(`Page 1 links: ${links.results.length}`);
    
    // 4. Text-to-Speech API pagination
    console.log('\n--- Text-to-Speech Pagination ---');
    
    // Get paginated TTS tasks
    const ttsTasks = await creatify.textToSpeech.getTextToSpeechPaginated(1, 5);
    console.log(`Total TTS tasks: ${ttsTasks.count}`);
    console.log(`Page 1 TTS tasks: ${ttsTasks.results.length}`);
    
    return {
      adultMaleAvatars: adultMaleAvatars.length,
      outdoorPresenters: outdoorPresenters.length,
      totalAvatars: page1.count,
      totalLinks: links.count,
      totalTtsTasks: ttsTasks.count
    };
  } catch (error) {
    console.error('Error demonstrating pagination and filtering:', error);
    return null;
  }
}

// Execute the demo
paginationAndFiltering().then(results => {
  console.log('\n--- Summary ---');
  console.log(results);
}).catch(error => {
  console.error('Demo failed:', error);
});
