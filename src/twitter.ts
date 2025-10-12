import axios from 'axios';
import type { Tweet } from './types.js';
import { RateLimitManager } from './utils/RateLimitManager.js';
import { config } from './config.js';

export class TwitterMonitor {
  private bearerToken: string;
  private baseUrl = 'https://api.twitter.com/2';
  private lastTweetId: string | null = null;

  constructor(bearerToken: string) {
    this.bearerToken = bearerToken;
  }

  async searchHashtag(hashtag: string, maxResults = 10): Promise<Tweet[]> {
    // Check if we're currently rate limited
    if (RateLimitManager.isCurrentlyRateLimited()) {
      const waitTime = RateLimitManager.getRemainingWaitTime();
      console.log(`⏸️ Still rate limited. ${waitTime} minutes remaining.`);
      return [];
    }

    const searchUrl = `${this.baseUrl}/tweets/search/recent`;
    
    const params = new URLSearchParams({
      query: `#${hashtag} -is:retweet`,
      max_results: Math.min(maxResults, 100).toString(),
      'tweet.fields': 'created_at,author_id,public_metrics,attachments',
      'user.fields': 'username,name,profile_image_url',
      'media.fields': 'type,url,preview_image_url',
      'expansions': 'author_id,attachments.media_keys',
    });

    // Add today filter if enabled
    if (config.monitoring.todayOnly) {
      // Get today's date in configured timezone and convert to UTC
      const today = new Date();
      const timezoneOffset = config.monitoring.timezoneOffset * 60; // Convert hours to minutes
      const nowInLocalTz = new Date(today.getTime() + (timezoneOffset * 60 * 1000));
      
      // Set to start of day in local timezone, then convert back to UTC
      const startOfDayLocal = new Date(nowInLocalTz.getFullYear(), nowInLocalTz.getMonth(), nowInLocalTz.getDate());
      const startTime = new Date(startOfDayLocal.getTime() - (timezoneOffset * 60 * 1000)).toISOString();
      
      params.append('start_time', startTime);
    }

    // Add since_id to get only new tweets since last check
    if (this.lastTweetId) {
      params.append('since_id', this.lastTweetId);
    }

    try {
      if (config.monitoring.todayOnly) {
        const today = new Date();
        const timezoneOffset = config.monitoring.timezoneOffset * 60;
        const nowInLocalTz = new Date(today.getTime() + (timezoneOffset * 60 * 1000));
        const localDate = nowInLocalTz.toLocaleDateString('id-ID', { 
          timeZone: 'Asia/Jakarta',
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        });
        console.log(`🔍 Searching tweets for #${hashtag} (hari ini: ${localDate} UTC+${config.monitoring.timezoneOffset})`);
      } else {
        console.log(`🔍 Searching tweets for #${hashtag} (semua waktu)`);
      }
      
      const response = await axios.get(`${searchUrl}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'User-Agent': 'NgoplyHashtagMonitor/1.0',
        },
        timeout: 10000,
      });

      const data = response.data;
      
      if (!data.data || data.data.length === 0) {
        console.log(`ℹ️ No new tweets found for #${hashtag} today`);
        return [];
      }

      // Update last tweet ID
      this.lastTweetId = data.data[0].id;

      // Transform Twitter API response to our Tweet format
      const tweets = this.transformTweets(data);
      
      console.log(`🔍 Found ${tweets.length} new tweets for #${hashtag} today`);
      return tweets;

    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        if (status === 429) {
          // Extract rate limit info from headers
          const resetTime = error.response.headers['x-rate-limit-reset'];
          const remainingRequests = error.response.headers['x-rate-limit-remaining'];
          
          console.warn('⚠️ Twitter API rate limit exceeded');
          console.warn(`📊 Remaining requests: ${remainingRequests || 'unknown'}`);
          
          if (resetTime) {
            const resetDate = new Date(parseInt(resetTime) * 1000);
            RateLimitManager.setRateLimit(resetDate);
            
            const waitTime = Math.max(0, resetDate.getTime() - Date.now());
            const waitMinutes = Math.ceil(waitTime / (1000 * 60));
            
            console.warn(`⏱️ Rate limit resets at: ${resetDate.toLocaleTimeString()}`);
            console.warn(`⏳ Wait time: ~${waitMinutes} minutes`);
          } else {
            // Fallback: assume 15 minute reset
            const resetDate = new Date(Date.now() + 15 * 60 * 1000);
            RateLimitManager.setRateLimit(resetDate);
          }
          
          throw new Error(`Rate limit exceeded. Try again later.`);
        } else if (status === 401) {
          console.error('❌ Twitter API authentication failed. Check your bearer token.');
          throw new Error('Authentication failed');
        } else if (status === 403) {
          console.error('❌ Twitter API access forbidden. Check your app permissions.');
          throw new Error('Access forbidden');
        } else {
          console.error(`❌ Twitter API error (${status}):`, errorData);
          throw new Error(`Twitter API error: ${status}`);
        }
      } else {
        console.error('❌ Network error while fetching tweets:', error.message);
        throw error;
      }
    }
  }

  private transformTweets(data: any): Tweet[] {
    const tweets: Tweet[] = [];
    
    // Create lookup maps for users and media
    const usersMap = new Map();
    const mediaMap = new Map();
    
    if (data.includes?.users) {
      data.includes.users.forEach((user: any) => {
        usersMap.set(user.id, user);
      });
    }
    
    if (data.includes?.media) {
      data.includes.media.forEach((media: any) => {
        mediaMap.set(media.media_key, media);
      });
    }

    data.data.forEach((tweetData: any) => {
      const author = usersMap.get(tweetData.author_id);
      if (!author) return;

      const tweet: Tweet = {
        id: tweetData.id,
        text: tweetData.text,
        author: {
          id: author.id,
          username: author.username,
          name: author.name,
          profileImageUrl: author.profile_image_url,
        },
        createdAt: tweetData.created_at,
        url: `https://twitter.com/${author.username}/status/${tweetData.id}`,
      };

      // Add metrics if available
      if (tweetData.public_metrics) {
        tweet.metrics = {
          likeCount: tweetData.public_metrics.like_count || 0,
          retweetCount: tweetData.public_metrics.retweet_count || 0,
          replyCount: tweetData.public_metrics.reply_count || 0,
          quoteCount: tweetData.public_metrics.quote_count || 0,
        };
      }

      // Add media if available
      if (tweetData.attachments?.media_keys) {
        tweet.media = tweetData.attachments.media_keys
          .map((key: string) => mediaMap.get(key))
          .filter((media: any) => media)
          .map((media: any) => ({
            type: media.type,
            url: media.url || media.preview_image_url,
            previewImageUrl: media.preview_image_url,
          }));
      }

      tweets.push(tweet);
    });

    return tweets.reverse(); // Return oldest first
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/tweets/search/recent?query=test&max_results=1`, {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
        },
        timeout: 5000,
      });
      
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}