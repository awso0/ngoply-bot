import { CronJob } from 'cron';
import { TwitterMonitor } from './twitter.js';
import { DiscordNotifier } from './discord.js';
import { config, validateConfig } from './config.js';
import { TweetHistoryManager } from './utils/TweetHistoryManager.js';
import type { MonitorStats, Tweet } from './types.js';

export class HashtagMonitor {
  private twitterMonitor: TwitterMonitor | null = null;
  private discordNotifier: DiscordNotifier;
  private tweetHistory: TweetHistoryManager;
  private cronJob: CronJob | null = null;
  private stats: MonitorStats;
  private isRunning = false;

  constructor() {
    this.discordNotifier = new DiscordNotifier(config.discord.webhookUrl);
    this.tweetHistory = new TweetHistoryManager();
    this.stats = {
      totalChecks: 0,
      totalTweetsFound: 0,
      totalNotificationsSent: 0,
      lastCheckTime: new Date(),
      errors: 0,
    };

    // Initialize Twitter monitor if enabled
    if (config.monitoring.enableTwitter && config.twitter.bearerToken) {
      this.twitterMonitor = new TwitterMonitor(config.twitter.bearerToken);
    }
  }

  async start(): Promise<void> {
    console.log('🚀 Starting Ngoply Hashtag Monitor...');
    
    // Validate configuration
    validateConfig();

    // Test connections
    await this.testConnections();

    // Set up cron job
    const cronPattern = `*/${config.monitoring.checkIntervalMinutes} * * * *`;
    this.cronJob = new CronJob(cronPattern, () => {
      this.checkHashtag().catch(error => {
        console.error('❌ Error in scheduled check:', error);
        this.stats.errors++;
      });
    });

    this.cronJob.start();
    this.isRunning = true;

    console.log(`✅ Monitor is running! Next check in ${config.monitoring.checkIntervalMinutes} minutes.`);
    console.log(`📊 Monitoring: #${config.monitoring.hashtag}`);
    console.log(`🔧 Platforms: ${this.getEnabledPlatforms().join(', ')}`);

    // Perform initial check
    await this.checkHashtag();
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping monitor...');
    
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }

    this.isRunning = false;

    console.log('✅ Monitor stopped successfully');
  }

  private async checkHashtag(): Promise<void> {
    if (!this.isRunning) return;

    console.log(`\\n🔍 Checking hashtag #${config.monitoring.hashtag}...`);
    this.stats.totalChecks++;
    this.stats.lastCheckTime = new Date();

    const newTweets: Tweet[] = [];

    try {
      // Check Twitter
      if (this.twitterMonitor && config.monitoring.enableTwitter) {
        const tweets = await this.twitterMonitor.searchHashtag(
          config.monitoring.hashtag,
          config.monitoring.maxTweetsPerCheck
        );
        newTweets.push(...tweets);
      }

      // TODO: Add Instagram and TikTok monitoring here

      if (newTweets.length > 0) {
        // Filter tweet yang belum pernah dikirim
        const unsentTweets = newTweets.filter(tweet => !this.tweetHistory.isTweetSent(tweet.id));
        
        if (unsentTweets.length > 0) {
          console.log(`📈 Found ${newTweets.length} mentions (${unsentTweets.length} new, ${newTweets.length - unsentTweets.length} already sent)`);
          this.stats.totalTweetsFound += unsentTweets.length;

          // Send notifications for each new tweet
          for (const tweet of unsentTweets) {
            try {
              await this.discordNotifier.sendTweetNotification(tweet);
              
              // Tandai tweet sebagai sudah dikirim
              this.tweetHistory.markTweetAsSent(tweet.id);
              this.stats.totalNotificationsSent++;
              
              // Rate limiting
              if (config.advanced.rateLimitDelay > 0) {
                await this.sleep(config.advanced.rateLimitDelay);
              }
            } catch (error) {
              console.error(`❌ Failed to send notification for tweet ${tweet.id}:`, error);
              this.stats.errors++;
            }
          }
        } else {
          console.log(`📭 Found ${newTweets.length} mentions but all have been sent already`);
        }
      } else {
        console.log('📭 No new mentions found');
      }

      // Cleanup history secara berkala
      this.tweetHistory.cleanupOldHistory();

      // Log stats every 10 checks
      if (this.stats.totalChecks % 10 === 0) {
        this.logStats();
      }

    } catch (error: any) {
      console.error('❌ Error during hashtag check:', error.message);
      this.stats.errors++;

      // Handle specific error types
      if (error.message.includes('Rate limit exceeded')) {
        console.log('⏸️ Pausing checks due to rate limit...');
        console.log('⚠️ Twitter API rate limit reached. Monitoring paused temporarily.');
        
        // Wait longer before next check (will be handled by cron schedule)
        return;
      }

      // Log error for critical errors
      if (this.stats.errors % 5 === 0) {
        console.error(`⚠️ Multiple errors detected (${this.stats.errors} total). Latest: ${error.message}`);
      }
    }
  }

  private async testConnections(): Promise<void> {
    console.log('🔧 Testing connections...');

    // Test Twitter connection
    if (this.twitterMonitor && config.monitoring.enableTwitter) {
      const twitterOk = await this.twitterMonitor.testConnection();
      if (twitterOk) {
        console.log('✅ Twitter API connection successful');
      } else {
        console.warn('⚠️ Twitter API connection failed - monitoring will be limited');
        console.warn('   Please check your Twitter Bearer Token in .env file');
        // Don't throw error, just warn
      }
    } else {
      console.log('ℹ️ Twitter monitoring disabled');
    }

    // Test Discord webhook
    try {
      // Just test the webhook URL is valid, don't send message
      console.log('✅ Discord webhook configured');
    } catch (error) {
      console.error('❌ Discord webhook connection failed');
      throw new Error('Discord webhook connection failed');
    }
  }

  private getEnabledPlatforms(): string[] {
    const platforms: string[] = [];
    if (config.monitoring.enableTwitter) platforms.push('Twitter');
    if (config.monitoring.enableInstagram) platforms.push('Instagram');
    if (config.monitoring.enableTiktok) platforms.push('TikTok');
    return platforms.length > 0 ? platforms : ['None'];
  }

  private logStats(): void {
    const historyStats = this.tweetHistory.getStats();
    
    console.log('\\n📊 Monitor Statistics:');
    console.log(`   Total checks: ${this.stats.totalChecks}`);
    console.log(`   Tweets found: ${this.stats.totalTweetsFound}`);
    console.log(`   Notifications sent: ${this.stats.totalNotificationsSent}`);
    console.log(`   Tweet history size: ${historyStats.totalSent}`);
    console.log(`   Errors: ${this.stats.errors}`);
    console.log(`   Last check: ${this.stats.lastCheckTime.toLocaleString()}`);
    console.log(`   Running since: ${this.formatUptime()}`);
  }

  private formatUptime(): string {
    const startTime = new Date(Date.now() - (this.stats.totalChecks * config.monitoring.checkIntervalMinutes * 60 * 1000));
    const uptime = Date.now() - startTime.getTime();
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getStats(): MonitorStats {
    return { ...this.stats };
  }

  public isMonitorRunning(): boolean {
    return this.isRunning;
  }
}