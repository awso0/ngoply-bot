import { TwitterMonitor } from '../twitter.js';
import { config } from '../config.js';

async function debugTwitterSearch() {
  console.log('🔍 Debugging Twitter Search for #ngoply...');
  console.log('===========================================\n');
  
  console.log('📋 Current Configuration:');
  console.log(`   Hashtag: ${config.monitoring.hashtag}`);
  console.log(`   Max Tweets: ${config.monitoring.maxTweetsPerCheck}`);
  console.log(`   Today Only: ${config.monitoring.todayOnly}`);
  console.log(`   Timezone: UTC+${config.monitoring.timezoneOffset}`);
  console.log(`   Bearer Token: ${config.twitter.bearerToken ? 'Set ✅' : 'Not Set ❌'}`);
  
  // Show current time info
  const now = new Date();
  const timezoneOffset = config.monitoring.timezoneOffset * 60;
  const nowInLocalTz = new Date(now.getTime() + (timezoneOffset * 60 * 1000));
  
  console.log('\n🕒 Time Information:');
  console.log(`   Current UTC: ${now.toISOString()}`);
  console.log(`   Current Local: ${nowInLocalTz.toLocaleString('id-ID')}`);
  
  if (config.monitoring.todayOnly) {
    const startOfDayLocal = new Date(nowInLocalTz.getFullYear(), nowInLocalTz.getMonth(), nowInLocalTz.getDate());
    const startTime = new Date(startOfDayLocal.getTime() - (timezoneOffset * 60 * 1000));
    
    console.log(`   Search Start: ${startTime.toISOString()}`);
    console.log(`   Search Start Local: ${startOfDayLocal.toLocaleString('id-ID')}`);
  }
  
  console.log('\n🐦 Testing Twitter API...');
  
  const twitterMonitor = new TwitterMonitor(config.twitter.bearerToken);
  
  try {
    console.log('📡 Sending request to Twitter API...');
    const tweets = await twitterMonitor.searchHashtag('ngoply', 10);
    
    console.log(`\n📊 Search Results: ${tweets.length} tweets found`);
    
    if (tweets.length === 0) {
      console.log('\n❌ No tweets found. Possible reasons:');
      console.log('   1. Tweet mungkin belum diindex oleh Twitter API (delay 1-2 menit)');
      console.log('   2. Hashtag tidak persis #ngoply');
      console.log('   3. Tweet adalah retweet (filtered out)');
      console.log('   4. Tweet diluar filter waktu hari ini');
      console.log('   5. API rate limit atau connection issue');
      console.log('   6. Token tidak valid atau expired');
      
      console.log('\n💡 Troubleshooting:');
      console.log('   - Pastikan tweet menggunakan hashtag #ngoply (lowercase)');
      console.log('   - Coba tweet lagi dan tunggu 2-3 menit');
      console.log('   - Pastikan tweet bukan retweet');
      console.log('   - Check apakah tweet dibuat hari ini');
    } else {
      console.log('\n✅ Found tweets:');
      tweets.forEach((tweet, index) => {
        const tweetDate = new Date(tweet.createdAt);
        const localTweetDate = new Date(tweetDate.getTime() + (timezoneOffset * 60 * 1000));
        
        console.log(`\n   ${index + 1}. Tweet ID: ${tweet.id}`);
        console.log(`      Author: @${tweet.author.username} (${tweet.author.name})`);
        console.log(`      Created: ${localTweetDate.toLocaleString('id-ID')} WIB`);
        console.log(`      Text: "${tweet.text.substring(0, 100)}..."`);
        console.log(`      URL: ${tweet.url}`);
        
        if (tweet.metrics) {
          console.log(`      Metrics: ${tweet.metrics.likeCount} likes, ${tweet.metrics.retweetCount} retweets`);
        }
      });
    }
    
  } catch (error: any) {
    console.error('\n❌ Twitter API Error:');
    console.error(`   Message: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
      
      if (error.response.data) {
        console.error(`   API Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      if (error.response.status === 401) {
        console.error('\n🔑 Authentication Error:');
        console.error('   - Check TWITTER_BEARER_TOKEN in .env file');
        console.error('   - Token might be invalid or expired');
        console.error('   - Verify Twitter API access permissions');
      }
      
      if (error.response.status === 429) {
        console.error('\n⏰ Rate Limit Error:');
        console.error('   - Too many requests to Twitter API');
        console.error('   - Wait for rate limit reset');
        console.error('   - Consider increasing check interval');
      }
    }
  }
}

debugTwitterSearch();