import { Creatify } from '../src';

/**
 * Example: Custom Templates API
 * 
 * This example demonstrates how to use the Creatify API to create videos with custom templates.
 * 
 * To run this example:
 * 1. Build the library: npm run build
 * 2. Run with your API credentials: 
 *    npx ts-node examples/custom-templates.ts YOUR_API_ID YOUR_API_KEY
 */

// Get API credentials from command line arguments
const apiId = process.argv[2];
const apiKey = process.argv[3];

if (!apiId || !apiKey) {
  console.error('Please provide your API ID and API Key as command line arguments');
  console.error('Example: npx ts-node examples/custom-templates.ts YOUR_API_ID YOUR_API_KEY');
  process.exit(1);
}

// Initialize the Creatify API client
const creatify = new Creatify({
  apiId,
  apiKey
});

async function main() {
  try {
    console.log('Creating a real estate listing video using a custom template...');
    
    // Example data for a real estate listing
    const templateData = {
      visual_style: "HouseSale",
      data: {
        address: "123 Maple Avenue",
        city: "Los Angeles",
        state: "CA",
        sqft: 2400,
        bedrooms: 4,
        bathrooms: 3,
        price: 950000,
        estimated_monthly_payment: 4750,
        openhouseDate_1: {
          date: "2023-09-23",
          time: "1:00pm"
        },
        listing_images: {
          image_1: "https://example.com/house1.jpg",
          image_2: "https://example.com/house2.jpg",
          image_3: "https://example.com/house3.jpg",
          image_4: "https://example.com/house4.jpg",
          image_5: "https://example.com/house5.jpg"
        },
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone_number: "555-123-4567",
        office_name: "Premier Real Estate",
        head_shot: "https://example.com/jane-smith.jpg"
      }
    };
    
    // Create a custom template video
    const response = await creatify.customTemplates.createCustomTemplate(templateData);
    
    console.log(`Custom template video task created successfully. Task ID: ${response.id}`);
    console.log('Polling for task completion (this may take several minutes)...');
    
    // Poll for completion
    let result = await creatify.customTemplates.getCustomTemplate(response.id);
    let dots = 0;
    
    while (result.status !== 'done' && result.status !== 'error') {
      const progressBar = '.'.repeat(dots);
      console.log(`Current status: ${result.status} ${progressBar}`);
      dots = (dots + 1) % 10;
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      result = await creatify.customTemplates.getCustomTemplate(response.id);
    }
    
    // Check final status
    if (result.status === 'error') {
      console.error(`Error in custom template task: ${result.error_message}`);
    } else {
      console.log(`Custom template video created successfully!`);
      console.log(`Video URL: ${result.output}`);
      console.log(`You can download or play the video from the URL above.`);
    }
    
    // Example of using the convenience method
    console.log('\nNow using the convenience method to create a product promotion video...');
    
    // Example data for a product promotion
    const productData = {
      visual_style: "ProductPromotion",
      data: {
        product_name: "Ultra Smart Watch",
        product_description: "The most advanced smart watch with health monitoring, fitness tracking, and smart notifications.",
        price: 299,
        discount_price: 249,
        discount_percentage: 17,
        product_features: [
          "Heart rate monitoring",
          "Sleep tracking",
          "Water resistant to 50m",
          "7-day battery life",
          "Smart notifications"
        ],
        product_images: {
          image_1: "https://example.com/watch1.jpg",
          image_2: "https://example.com/watch2.jpg",
          image_3: "https://example.com/watch3.jpg"
        },
        brand_logo: "https://example.com/brand-logo.png",
        call_to_action: "Shop Now",
        website: "www.example.com/shop"
      }
    };
    
    try {
      const result2 = await creatify.customTemplates.createAndWaitForCustomTemplate(
        productData, 
        5000,  // Poll every 5 seconds
        60     // Max 60 attempts (5 minutes)
      );
      
      console.log(`Convenience method completed with status: ${result2.status}`);
      if (result2.status === 'done') {
        console.log(`Video URL: ${result2.output}`);
      } else if (result2.status === 'error') {
        console.error(`Error in custom template task: ${result2.error_message}`);
      } else {
        console.log('Custom template task is still processing. You can check the status later with the task ID.');
      }
    } catch (error) {
      console.error('Timeout or error waiting for custom template completion:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
