import { TweetHistoryManager } from '../utils/TweetHistoryManager.js';

console.log('🧪 Testing Tweet History Manager...\n');

const historyManager = new TweetHistoryManager();

// Test 1: Check if tweet is sent
console.log('Test 1: Check unsent tweet');
const testTweetId1 = 'test_tweet_12345';
console.log(`   Is "${testTweetId1}" sent?`, historyManager.isTweetSent(testTweetId1));

// Test 2: Mark tweet as sent
console.log('\nTest 2: Mark tweet as sent');
historyManager.markTweetAsSent(testTweetId1);
console.log(`   Marked "${testTweetId1}" as sent`);
console.log(`   Is "${testTweetId1}" sent now?`, historyManager.isTweetSent(testTweetId1));

// Test 3: Check duplicate marking
console.log('\nTest 3: Mark same tweet again (should not duplicate)');
historyManager.markTweetAsSent(testTweetId1);
console.log(`   Marked "${testTweetId1}" again`);

// Test 4: Mark multiple tweets
console.log('\nTest 4: Mark multiple tweets');
const tweetIds = ['tweet_001', 'tweet_002', 'tweet_003'];
tweetIds.forEach(id => {
  historyManager.markTweetAsSent(id);
  console.log(`   Marked "${id}" as sent`);
});

// Test 5: Filter unsent tweets
console.log('\nTest 5: Filter unsent tweets');
const mixedTweets = ['tweet_001', 'tweet_new_1', 'tweet_002', 'tweet_new_2', 'tweet_003'];
const unsentTweets = historyManager.filterUnsentTweets(mixedTweets);
console.log('   All tweets:', mixedTweets);
console.log('   Unsent tweets:', unsentTweets);

// Test 6: Get stats
console.log('\nTest 6: Get statistics');
const stats = historyManager.getStats();
console.log('   Total sent:', stats.totalSent);
console.log('   Last cleanup:', stats.lastCleanup);

console.log('\n✅ All tests completed!');
console.log('\n💡 Tip: Check the "tweet-history.json" file in the project root to see stored data.');
