import { AvatarManager } from '../utils/AvatarManager.js';
import { config } from '../config.js';
import axios from 'axios';

async function testLocalAvatar() {
  console.log('🎨 Testing Local Avatar Configuration...');
  console.log('==========================================\n');
  
  // Log avatar info
  AvatarManager.logAvatarInfo(config.discord.avatarUrl || '');
  
  // Get Discord-compatible avatar URL
  const discordAvatarUrl = AvatarManager.getDiscordAvatarUrl(config.discord.avatarUrl || '');
  console.log(`\n🔗 Discord Avatar URL: ${discordAvatarUrl}`);
  
  // Test Discord webhook with local avatar handling
  console.log('\n🧪 Testing Discord Webhook...');
  
  try {
    const payload = {
      username: config.discord.botName,
      avatar_url: discordAvatarUrl,
      content: '🎨 **Local Avatar Test**: Testing avatar dari file lokal `./public/img/lily.jpg` ✨',
      embeds: [{
        title: '🖼️ Avatar Configuration Test',
        description: 'Testing local avatar file handling untuk Discord webhook',
        color: config.discord.notificationColor,
        fields: [
          {
            name: '📁 Local Path',
            value: config.discord.avatarUrl || 'Not set',
            inline: true
          },
          {
            name: '🔗 Discord URL',
            value: discordAvatarUrl,
            inline: true
          },
          {
            name: '✅ File Exists',
            value: AvatarManager.avatarExists(config.discord.avatarUrl || '') ? 'Yes' : 'No',
            inline: true
          }
        ],
        footer: {
          text: 'Ngoply Monitor • Local Avatar Test',
          icon_url: discordAvatarUrl
        },
        timestamp: new Date().toISOString()
      }]
    };

    console.log('📤 Sending test message...');
    
    const response = await axios.post(config.discord.webhookUrl, payload);
    
    console.log('✅ Discord webhook test successful!');
    console.log(`📊 Response status: ${response.status}`);
    
    if (config.discord.avatarUrl?.startsWith('./')) {
      console.log('\n💡 Note: Local file detected.');
      console.log('   Discord webhooks require publicly accessible URLs.');
      console.log('   Using fallback avatar for now.');
      console.log('   Consider uploading avatar to imgur or CDN for production.');
    }
    
  } catch (error: any) {
    console.error('❌ Discord webhook test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

testLocalAvatar();