import { HashtagMonitor } from '../monitor.js';
import type { Tweet } from '../types.js';

async function testMode() {
  console.log('🧪 Running in TEST MODE');
  console.log('====================================\\n');

  const monitor = new HashtagMonitor();

  // Create mock tweet data for testing
  const mockTweet: Tweet = {
    id: '1234567890123456789',
    text: 'Sedang testing sistem monitoring hashtag #ngoply! 🚀 Semoga berjalan lancar dan bisa detect semua mention dengan baik.',
    author: {
      id: 'user123',
      username: 'testuser',
      name: 'Test User Ngoply',
      profileImageUrl: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'
    },
    createdAt: new Date().toISOString(),
    url: 'https://twitter.com/testuser/status/1234567890123456789',
    metrics: {
      likeCount: 25,
      retweetCount: 8,
      replyCount: 3,
      quoteCount: 2
    }
  };

  try {
    console.log('📝 Testing Discord notification...');
    
    // Test Discord notification directly
    const discordNotifier = (monitor as any).discordNotifier;
    await discordNotifier.sendTweetNotification(mockTweet);
    
    console.log('✅ Discord notification test successful!');
    console.log('\\n📊 Mock tweet sent:');
    console.log(`   Author: ${mockTweet.author.name} (@${mockTweet.author.username})`);
    console.log(`   Content: ${mockTweet.text}`);
    console.log(`   Engagement: ${mockTweet.metrics?.likeCount} likes, ${mockTweet.metrics?.retweetCount} retweets`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Check if running in test mode
const args = process.argv.slice(2);
if (args.includes('--test')) {
  testMode();
} else {
  console.log('🔥 Run with --test flag for test mode');
  console.log('Example: npm run dev -- --test');
}