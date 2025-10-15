import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TweetHistory {
  sentTweetIds: string[];
  lastCleanup: string;
}

export class TweetHistoryManager {
  private historyFile: string;
  private maxHistorySize = 1000; // Maksimal 1000 tweet ID yang disimpan

  constructor() {
    // Simpan history di root project
    this.historyFile = path.join(__dirname, '..', '..', 'tweet-history.json');
    this.initializeHistory();
  }

  private initializeHistory(): void {
    if (!fs.existsSync(this.historyFile)) {
      const initialHistory: TweetHistory = {
        sentTweetIds: [],
        lastCleanup: new Date().toISOString(),
      };
      fs.writeFileSync(this.historyFile, JSON.stringify(initialHistory, null, 2));
      console.log('📝 Created new tweet history file');
    }
  }

  private readHistory(): TweetHistory {
    try {
      const data = fs.readFileSync(this.historyFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Error reading history file:', error);
      return {
        sentTweetIds: [],
        lastCleanup: new Date().toISOString(),
      };
    }
  }

  private writeHistory(history: TweetHistory): void {
    try {
      fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('❌ Error writing history file:', error);
    }
  }

  /**
   * Cek apakah tweet sudah pernah dikirim
   */
  public isTweetSent(tweetId: string): boolean {
    const history = this.readHistory();
    return history.sentTweetIds.includes(tweetId);
  }

  /**
   * Tandai tweet sebagai sudah dikirim
   */
  public markTweetAsSent(tweetId: string): void {
    const history = this.readHistory();
    
    if (!history.sentTweetIds.includes(tweetId)) {
      history.sentTweetIds.push(tweetId);
      
      // Batasi ukuran history
      if (history.sentTweetIds.length > this.maxHistorySize) {
        history.sentTweetIds = history.sentTweetIds.slice(-this.maxHistorySize);
        console.log(`🧹 Trimmed history to ${this.maxHistorySize} entries`);
      }
      
      this.writeHistory(history);
    }
  }

  /**
   * Filter tweet yang belum pernah dikirim
   */
  public filterUnsentTweets(tweetIds: string[]): string[] {
    const history = this.readHistory();
    return tweetIds.filter(id => !history.sentTweetIds.includes(id));
  }

  /**
   * Bersihkan history lama secara otomatis
   */
  public cleanupOldHistory(): void {
    const history = this.readHistory();
    const lastCleanup = new Date(history.lastCleanup);
    const now = new Date();
    
    // Cek apakah sudah waktunya cleanup (setiap 24 jam)
    const hoursSinceCleanup = (now.getTime() - lastCleanup.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCleanup >= 24) {
      console.log('🧹 Performing scheduled history cleanup...');
      
      // Batasi jumlah entry (simpan yang terbaru saja)
      if (history.sentTweetIds.length > this.maxHistorySize) {
        const oldCount = history.sentTweetIds.length;
        history.sentTweetIds = history.sentTweetIds.slice(-this.maxHistorySize);
        console.log(`   Removed ${oldCount - history.sentTweetIds.length} old entries`);
      }
      
      history.lastCleanup = now.toISOString();
      this.writeHistory(history);
      
      console.log(`✅ Cleanup complete. Current history size: ${history.sentTweetIds.length}`);
    }
  }

  /**
   * Reset seluruh history (untuk testing atau maintenance)
   */
  public resetHistory(): void {
    const history: TweetHistory = {
      sentTweetIds: [],
      lastCleanup: new Date().toISOString(),
    };
    this.writeHistory(history);
    console.log('🔄 Tweet history has been reset');
  }

  /**
   * Dapatkan statistik history
   */
  public getStats(): { totalSent: number; lastCleanup: string } {
    const history = this.readHistory();
    return {
      totalSent: history.sentTweetIds.length,
      lastCleanup: history.lastCleanup,
    };
  }
}
