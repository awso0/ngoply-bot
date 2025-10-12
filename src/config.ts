import dotenv from 'dotenv';
import type { Config } from './types.js';

// Load environment variables
dotenv.config();

export const config: Config = {
  discord: {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
    botToken: process.env.DISCORD_BOT_TOKEN,
    botName: process.env.BOT_NAME || 'Ngoply Bolo',
    avatarUrl: process.env.BOT_AVATAR_URL || 'https://i.imgur.com/nBgdlQs.png',
    notificationColor: parseInt(process.env.NOTIFICATION_COLOR || '0x00ff00', 16),
  },
  twitter: {
    bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },
  monitoring: {
    hashtag: process.env.SEARCH_HASHTAG || '#ngoply',
    checkIntervalMinutes: parseInt(process.env.CHECK_INTERVAL_MINUTES || '10', 10),
    maxTweetsPerCheck: parseInt(process.env.MAX_TWEETS_PER_CHECK || '10', 10),
    enableTwitter: process.env.ENABLE_TWITTER === 'true',
    enableInstagram: process.env.ENABLE_INSTAGRAM === 'true',
    enableTiktok: process.env.ENABLE_TIKTOK === 'true',
    timezoneOffset: parseInt(process.env.TIMEZONE_OFFSET || '7', 10), // Default: WIB (UTC+7)
    todayOnly: process.env.TODAY_ONLY !== 'false', // Default: true
    maxAgeHours: parseInt(process.env.MAX_AGE_HOURS || '1', 10), // Default: 1 hour
  },
  advanced: {
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '1000', 10),
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
  },
};

// Validation
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.discord.webhookUrl) {
    errors.push('DISCORD_WEBHOOK_URL is required');
  }

  if (config.monitoring.enableTwitter && !config.twitter.bearerToken) {
    errors.push('TWITTER_BEARER_TOKEN is required when Twitter monitoring is enabled');
  }

  if (!config.monitoring.hashtag) {
    errors.push('SEARCH_HASHTAG is required');
  }

  if (config.monitoring.checkIntervalMinutes < 1) {
    errors.push('CHECK_INTERVAL_MINUTES must be at least 1');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log('✅ Configuration validated successfully');
}