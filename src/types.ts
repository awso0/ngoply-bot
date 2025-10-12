export interface Config {
  discord: {
    webhookUrl: string;
    botToken?: string;
    botName: string;
    avatarUrl?: string;
    notificationColor: number;
  };
  twitter: {
    bearerToken: string;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    accessTokenSecret?: string;
  };
  monitoring: {
    hashtag: string;
    checkIntervalMinutes: number;
    maxTweetsPerCheck: number;
    enableTwitter: boolean;
    enableInstagram: boolean;
    enableTiktok: boolean;
    timezoneOffset: number;
    todayOnly: boolean;
    maxAgeHours: number;
  };
  advanced: {
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    rateLimitDelay: number;
    retryAttempts: number;
  };
}

export interface Tweet {
  id: string;
  text: string;
  author: {
    id: string;
    username: string;
    name: string;
    profileImageUrl?: string;
  };
  createdAt: string;
  url: string;
  metrics?: {
    likeCount: number;
    retweetCount: number;
    replyCount: number;
    quoteCount: number;
  };
  media?: MediaItem[];
}

export interface MediaItem {
  type: 'photo' | 'video' | 'gif';
  url: string;
  previewImageUrl?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  image?: {
    url: string;
  };
  thumbnail?: {
    url: string;
  };
}

export interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbed[];
}

export interface MonitorStats {
  totalChecks: number;
  totalTweetsFound: number;
  totalNotificationsSent: number;
  lastCheckTime: Date;
  errors: number;
}