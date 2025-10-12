import { RateLimitManager } from '../utils/RateLimitManager.js';

function displayRateLimitStatus() {
  console.log('🔍 Twitter API Rate Limit Status');
  console.log('================================');
  
  if (RateLimitManager.isCurrentlyRateLimited()) {
    const waitTime = RateLimitManager.getRemainingWaitTime();
    console.log('🚫 Status: RATE LIMITED');
    console.log(`⏳ Remaining wait time: ${waitTime} minutes`);
    console.log('💡 Tip: Wait for rate limit to reset or increase CHECK_INTERVAL_MINUTES');
  } else {
    console.log('✅ Status: OK - No rate limit active');
    console.log('🚀 API calls can proceed normally');
  }
  
  console.log('\\n📊 Rate Limit Guidelines:');
  console.log('• Twitter API v2: 300 requests per 15 minutes');
  console.log('• Recommended interval: 10+ minutes between checks');
  console.log('• Reduce MAX_TWEETS_PER_CHECK if hitting limits');
  console.log('\\n🔧 Configuration tips:');
  console.log('• Set CHECK_INTERVAL_MINUTES to 10 or higher');
  console.log('• Set MAX_TWEETS_PER_CHECK to 5 or lower');
  console.log('• Monitor logs for rate limit warnings');
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--status') || args.includes('-s')) {
  displayRateLimitStatus();
} else {
  console.log('🔍 Rate Limit Checker');
  console.log('Usage: tsx src/rate-limit-check.ts --status');
  console.log('   or: npm run check:rate-limit');
}