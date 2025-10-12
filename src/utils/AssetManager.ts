import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AssetManager {
  private static assetsPath = join(__dirname, '../assets');

  /**
   * Get path to bot avatar
   * @param filename - Avatar filename (e.g., 'ngoply-bot.png')
   * @returns Full path to avatar or null if not found
   */
  static getBotAvatar(filename: string): string | null {
    const avatarPath = join(this.assetsPath, 'bot/avatar', filename);
    return existsSync(avatarPath) ? avatarPath : null;
  }

  /**
   * Get path to icon
   * @param filename - Icon filename
   * @returns Full path to icon or null if not found
   */
  static getIcon(filename: string): string | null {
    const iconPath = join(this.assetsPath, 'icons', filename);
    return existsSync(iconPath) ? iconPath : null;
  }

  /**
   * Get default bot avatar URL (fallback)
   * @returns Default avatar URL or local path
   */
  static getDefaultBotAvatar(): string {
    // Try to find local avatar first
    const localAvatars = [
      'ngoply-bot.png',
      'ngoply-avatar.jpg',
      'bot-icon.png',
      'avatar.png'
    ];

    for (const avatar of localAvatars) {
      const path = this.getBotAvatar(avatar);
      if (path) {
        return path;
      }
    }

    // Fallback to online default
    return 'https://cdn.discordapp.com/embed/avatars/0.png';
  }

  /**
   * Validate if avatar file exists and is accessible
   * @param avatarUrl - URL or path to avatar
   * @returns boolean indicating if avatar is valid
   */
  static validateAvatar(avatarUrl: string): boolean {
    // If it's a URL, assume it's valid (will be checked when used)
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return true;
    }

    // If it's a local path, check if file exists
    return existsSync(avatarUrl);
  }

  /**
   * Get all available bot avatars
   * @returns Array of available avatar paths
   */
  static getAvailableBotAvatars(): string[] {
    const avatarDir = join(this.assetsPath, 'bot/avatar');
    if (!existsSync(avatarDir)) {
      return [];
    }

    const fs = require('fs');
    return fs.readdirSync(avatarDir)
      .filter((file: string) => 
        file.match(/\.(png|jpg|jpeg|gif|webp)$/i) && 
        !file.startsWith('.')
      )
      .map((file: string) => join(avatarDir, file));
  }
}

// Helper function for easy import
export function getBotAvatarUrl(filename?: string): string {
  if (filename) {
    const path = AssetManager.getBotAvatar(filename);
    if (path) return path;
  }
  
  return AssetManager.getDefaultBotAvatar();
}