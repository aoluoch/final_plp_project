require('dotenv').config();

console.log('🔍 Environment Variables Check');
console.log('================================');

const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GEMINI_API_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const optionalVars = [
  'NODE_ENV',
  'PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'FRONTEND_URL'
];

console.log('\n✅ Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ${varName}: ${varName.includes('SECRET') || varName.includes('KEY') ? '***' : value.substring(0, 20) + '...'}`);
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: NOT SET (optional)`);
  }
});

console.log('\n🤖 AI Verification Status:');
if (process.env.GEMINI_API_KEY) {
  console.log('  ✅ Gemini API key is configured');
  console.log('  ✅ AI image verification should work');
} else {
  console.log('  ❌ Gemini API key is missing');
  console.log('  ⚠️  AI verification will fail-open (allow all images)');
}

console.log('\n📁 Environment file location: .env');
console.log('💡 Make sure your .env file is in the server directory');
