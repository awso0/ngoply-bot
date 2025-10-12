import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AvatarManager {
  private static projectRoot = path.resolve(__dirname, '../..');
  
  static getAvatarPath(avatarUrl: string): string {
    // If it's already a URL, return as is
    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    
    // Convert relative path to absolute
    if (avatarUrl.startsWith('./')) {
      return path.resolve(this.projectRoot, avatarUrl.substring(2));
    }
    
    return path.resolve(this.projectRoot, avatarUrl);
  }
  
  static avatarExists(avatarUrl: string): boolean {
    if (avatarUrl.startsWith('http')) {
      return true; // Can't check remote URLs easily
    }
    
    const avatarPath = this.getAvatarPath(avatarUrl);
    return fs.existsSync(avatarPath);
  }
  
  static getAvatarAsBase64(avatarUrl: string): string | null {
    if (avatarUrl.startsWith('http')) {
      return null; // Can't convert remote URLs to base64
    }
    
    try {
      const avatarPath = this.getAvatarPath(avatarUrl);
      
      if (!fs.existsSync(avatarPath)) {
        console.error(`Avatar file not found: ${avatarPath}`);
        return null;
      }
      
      const fileBuffer = fs.readFileSync(avatarPath);
      const ext = path.extname(avatarPath).toLowerCase();
      
      let mimeType: string;
      switch (ext) {
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg';
          break;
        case '.png':
          mimeType = 'image/png';
          break;
        case '.gif':
          mimeType = 'image/gif';
          break;
        case '.webp':
          mimeType = 'image/webp';
          break;
        default:
          mimeType = 'image/jpeg';
      }
      
      return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Error converting avatar to base64:', error);
      return null;
    }
  }
  
  static getDiscordAvatarUrl(avatarUrl: string): string {
    // For Discord webhooks, we need a publicly accessible URL
    // Since Discord doesn't support base64 data URLs for avatars,
    // we'll need to either:
    // 1. Use a public URL (imgur, etc.)
    // 2. Host the file on a web server
    // 3. Use a fallback URL
    
    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }
    
    // For local files, return a fallback avatar for now
    // In production, you'd want to upload this to a CDN or image hosting service
    console.warn(`Local avatar detected: ${avatarUrl}`);
    console.warn('Discord webhooks require publicly accessible URLs');
    console.warn('Using fallback avatar. Consider uploading to imgur or CDN.');
    
    // Return a generic fallback avatar
    return 'https://i.imgur.com/8rKQx4m.png'; // Coffee latte fallback
  }
  
  static logAvatarInfo(avatarUrl: string): void {
    console.log('\n🎨 Avatar Configuration:');
    console.log(`   URL: ${avatarUrl}`);
    console.log(`   Type: ${avatarUrl.startsWith('http') ? 'Remote URL' : 'Local File'}`);
    
    if (!avatarUrl.startsWith('http')) {
      const fullPath = this.getAvatarPath(avatarUrl);
      console.log(`   Full Path: ${fullPath}`);
      console.log(`   Exists: ${this.avatarExists(avatarUrl) ? '✅' : '❌'}`);
      
      if (this.avatarExists(avatarUrl)) {
        try {
          const stats = fs.statSync(fullPath);
          console.log(`   Size: ${Math.round(stats.size / 1024)}KB`);
          console.log(`   Modified: ${stats.mtime.toLocaleDateString()}`);
        } catch (error) {
          console.log(`   Error reading file stats: ${error}`);
        }
      }
    }
  }
}