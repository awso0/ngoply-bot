import { describe, it, expect } from 'vitest'
import { DiscordNotifier } from '../discord.js'
import type { Tweet } from '../types.js'

describe('DiscordNotifier', () => {
  const mockWebhookUrl = 'https://discord.com/api/webhooks/test/test'
  const notifier = new DiscordNotifier(mockWebhookUrl)

  it('should create tweet embed with correct structure', () => {
    const mockTweet: Tweet = {
      id: '1234567890',
      text: 'This is a test tweet with #ngoply hashtag! 🚀',
      author: {
        id: 'user123',
        username: 'testuser',
        name: 'Test User',
        profileImageUrl: 'https://example.com/avatar.jpg'
      },
      createdAt: '2024-01-01T12:00:00.000Z',
      url: 'https://twitter.com/testuser/status/1234567890',
      metrics: {
        likeCount: 10,
        retweetCount: 5,
        replyCount: 2,
        quoteCount: 1
      }
    }

    // Test private method through reflection (for testing purposes)
    const embed = (notifier as any).createTweetEmbed(mockTweet)
    
    expect(embed.title).toContain('#ngoply')
    expect(embed.description).toBe(mockTweet.text)
    expect(embed.author?.name).toContain(mockTweet.author.username)
    expect(embed.fields).toBeDefined()
    expect(embed.fields?.length).toBeGreaterThan(0)
  })

  it('should truncate long text correctly', () => {
    const longText = 'a'.repeat(2100) // Longer than Discord limit
    const truncated = (notifier as any).truncateText(longText, 2048)
    
    expect(truncated.length).toBeLessThanOrEqual(2048)
    expect(truncated).toMatch(/\.\.\.$/)
  })
})