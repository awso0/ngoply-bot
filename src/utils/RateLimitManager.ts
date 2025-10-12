export class RateLimitManager {
  private static rateLimitResetTime: Date | null = null;
  private static isRateLimited = false;

  /**
   * Check if we're currently rate limited
   */
  static isCurrentlyRateLimited(): boolean {
    if (!this.rateLimitResetTime) return false;
    
    const now = new Date();
    if (now >= this.rateLimitResetTime) {
      // Rate limit has expired
      this.isRateLimited = false;
      this.rateLimitResetTime = null;
      return false;
    }
    
    return this.isRateLimited;
  }

  /**
   * Set rate limit status
   * @param resetTime - When the rate limit will reset
   */
  static setRateLimit(resetTime: Date): void {
    this.isRateLimited = true;
    this.rateLimitResetTime = resetTime;
    
    const waitMinutes = Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60));
    console.log(`🚫 Rate limit set. Will reset in ${waitMinutes} minutes at ${resetTime.toLocaleTimeString()}`);
  }

  /**
   * Get remaining wait time in minutes
   */
  static getRemainingWaitTime(): number {
    if (!this.rateLimitResetTime) return 0;
    
    const waitTime = Math.max(0, this.rateLimitResetTime.getTime() - Date.now());
    return Math.ceil(waitTime / (1000 * 60));
  }

  /**
   * Clear rate limit status
   */
  static clearRateLimit(): void {
    this.isRateLimited = false;
    this.rateLimitResetTime = null;
    console.log('✅ Rate limit cleared');
  }

  /**
   * Wait until rate limit expires
   * @param maxWaitMinutes - Maximum minutes to wait (default: 15)
   */
  static async waitForReset(maxWaitMinutes = 15): Promise<void> {
    if (!this.isCurrentlyRateLimited()) return;

    const waitTime = Math.min(this.getRemainingWaitTime(), maxWaitMinutes);
    
    if (waitTime > 0) {
      console.log(`⏳ Waiting ${waitTime} minutes for rate limit reset...`);
      await this.sleep(waitTime * 60 * 1000);
    }
    
    this.clearRateLimit();
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}