import axios from 'axios';
import type { Tweet, DiscordWebhookPayload, DiscordEmbed } from './types.js';
import { config } from './config.js';

export class DiscordNotifier {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendTweetNotification(tweet: Tweet): Promise<void> {
    const embed = this.createTweetEmbed(tweet);
    
    const payload: DiscordWebhookPayload = {
      username: config.discord.botName,
      // avatar_url removed - using Discord default
      embeds: [embed],
    };

    try {
      await axios.post(this.webhookUrl, payload);
      console.log(`✅ Sent Discord notification for tweet: ${tweet.id}`);
    } catch (error) {
      console.error('❌ Failed to send Discord notification:', error);
      throw error;
    }
  }

  async sendStatusMessage(message: string, isError = false): Promise<void> {
    const payload: DiscordWebhookPayload = {
      username: config.discord.botName,
      // avatar_url removed - using Discord default
      content: `${isError ? '❌' : '📊'} **${config.discord.botName}**: ${message}`,
    };

    try {
      await axios.post(this.webhookUrl, payload);
    } catch (error) {
      console.error('❌ Failed to send status message:', error);
    }
  }

  private createTweetEmbed(tweet: Tweet): DiscordEmbed {
    const embed: DiscordEmbed = {
      title: `🐦 New #${config.monitoring.hashtag} mention found!`,
      description: this.truncateText(tweet.text, 2048),
      color: config.discord.notificationColor,
      timestamp: tweet.createdAt,
      author: {
        name: `${tweet.author.name} (@${tweet.author.username})`,
        url: `https://twitter.com/${tweet.author.username}`,
        icon_url: tweet.author.profileImageUrl,
      },
      footer: {
        text: 'Ngoply Hashtag Monitor',
        icon_url: config.discord.avatarUrl,
      },
    };

    // Add metrics if available
    if (tweet.metrics) {
      embed.fields = [
        {
          name: '📊 Engagement',
          value: [
            `❤️ ${tweet.metrics.likeCount} likes`,
            `🔄 ${tweet.metrics.retweetCount} retweets`,
            `💬 ${tweet.metrics.replyCount} replies`,
            `📝 ${tweet.metrics.quoteCount} quotes`,
          ].join('\\n'),
          inline: true,
        },
        {
          name: '🔗 Actions',
          value: `[View Tweet](${tweet.url})`,
          inline: true,
        },
      ];
    }

    // Add media if available
    if (tweet.media && tweet.media.length > 0) {
      const firstMedia = tweet.media[0];
      if (firstMedia.type === 'photo') {
        embed.image = { url: firstMedia.url };
      } else if (firstMedia.previewImageUrl) {
        embed.thumbnail = { url: firstMedia.previewImageUrl };
      }
    }

    return embed;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}