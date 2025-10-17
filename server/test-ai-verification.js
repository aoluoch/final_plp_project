const { verifyImagesAreWaste } = require('./src/services/aiImageVerifier');
require('dotenv').config();

async function testAIVerification() {
  console.log('Testing AI Image Verification...');
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    console.log('Please add GEMINI_API_KEY to your .env file');
    return;
  }

  // Test with a sample waste image URL (you can replace with actual test images)
  const testImageUrls = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', // Waste/garbage image
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'  // Person/portrait image
  ];

  try {
    console.log('\n🧪 Testing with waste image...');
    const wasteResult = await verifyImagesAreWaste([testImageUrls[0]]);
    console.log('Waste image result:', wasteResult);

    console.log('\n🧪 Testing with portrait image...');
    const portraitResult = await verifyImagesAreWaste([testImageUrls[1]]);
    console.log('Portrait image result:', portraitResult);

    console.log('\n🧪 Testing with multiple images...');
    const multipleResult = await verifyImagesAreWaste(testImageUrls);
    console.log('Multiple images result:', multipleResult);

    console.log('\n✅ AI verification test completed!');
  } catch (error) {
    console.error('❌ Error during AI verification test:', error.message);
  }
}

testAIVerification();
