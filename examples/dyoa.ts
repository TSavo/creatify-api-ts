import { Creatify } from '../src';

/**
 * Example: DYOA (Design Your Own Avatar) API
 * 
 * This example demonstrates how to use the Creatify API to create custom avatars.
 * 
 * To run this example:
 * 1. Build the library: npm run build
 * 2. Run with your API credentials: 
 *    npx ts-node examples/dyoa.ts YOUR_API_ID YOUR_API_KEY
 */

// Get API credentials from command line arguments
const apiId = process.argv[2];
const apiKey = process.argv[3];

if (!apiId || !apiKey) {
  console.error('Please provide your API ID and API Key as command line arguments');
  console.error('Example: npx ts-node examples/dyoa.ts YOUR_API_ID YOUR_API_KEY');
  process.exit(1);
}

// Initialize the Creatify API client
const creatify = new Creatify({
  apiId,
  apiKey
});

async function main() {
  try {
    console.log('Creating a custom avatar with DYOA...');
    
    // Create a DYOA request with avatar details
    const dyoaParams = {
      name: "Tech Expert Avatar",
      age_group: "adult",
      gender: "f",
      more_details: "Mid-length brown hair with subtle highlights, green eyes, warm smile, natural makeup, tech-savvy appearance, professional demeanor",
      outfit_description: "Professional blazer in navy blue, simple white blouse, minimal silver jewelry, modern glasses with thin frames, business casual look",
      background_description: "Modern tech office environment, clean desk with laptop and monitor, subtle city skyline visible through window, soft natural lighting"
    };
    
    // Create the DYOA
    const response = await creatify.dyoa.createDyoa(dyoaParams);
    
    console.log(`DYOA request created successfully. ID: ${response.id}`);
    console.log('Waiting for photo generation (this may take some time)...');
    
    // Poll for photo generation
    let result = await creatify.dyoa.getDyoa(response.id);
    let dots = 0;
    
    while (result.status === 'initializing' || result.photos.length === 0) {
      const progressBar = '.'.repeat(dots);
      console.log(`Current status: ${result.status} ${progressBar}`);
      dots = (dots + 1) % 10;
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      result = await creatify.dyoa.getDyoa(response.id);
    }
    
    console.log(`Photos generated successfully! Status: ${result.status}`);
    console.log(`Generated ${result.photos.length} photos:`);
    
    // Display the generated photos
    result.photos.forEach((photo, index) => {
      console.log(`Photo ${index + 1}: ${photo.image}`);
    });
    
    // Choose the first photo and submit for review
    if (result.photos.length > 0) {
      console.log(`\nSubmitting the first photo for review...`);
      
      const chosenPhotoId = result.photos[0].id;
      const submittedDyoa = await creatify.dyoa.submitDyoaForReview(result.id, {
        chosen_photo_id: chosenPhotoId
      });
      
      console.log(`DYOA submitted for review successfully. Status: ${submittedDyoa.status}`);
      console.log(`Review status: ${submittedDyoa.reviews[0]?.status || 'unknown'}`);
      
      console.log(`\nIMPORTANT: The DYOA review process is manual and may take some time.`);
      console.log(`You can check the status later using:`);
      console.log(`  - DYOA ID: ${submittedDyoa.id}`);
      console.log(`  - Review ID: ${submittedDyoa.reviews[0]?.id || 'unknown'}`);
    }
    
    // List all DYOAs
    console.log('\nListing all your DYOAs...');
    const dyoas = await creatify.dyoa.getDyoaList();
    
    console.log(`Found ${dyoas.length} DYOAs:`);
    dyoas.forEach((dyoa, index) => {
      console.log(`${index + 1}. ${dyoa.name} (ID: ${dyoa.id}, Status: ${dyoa.status})`);
    });
    
    console.log('\nNote: The DYOA process involves several steps:');
    console.log('1. Create DYOA request with avatar details');
    console.log('2. Wait for photo generation');
    console.log('3. Choose a photo and submit for review');
    console.log('4. Wait for manual review and approval');
    console.log('5. Once approved, the avatar becomes available for use');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
