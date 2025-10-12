import axios from 'axios';
import { config } from '../config.js';

async function testDiscordWebhook() {
  console.log('🧪 Testing Discord Webhook...');
  console.log('🔧 Avatar URL:', config.discord.avatarUrl);
  
  try {
    const payload = {
      username: config.discord.botName,
      avatar_url: config.discord.avatarUrl,
      content: '🧪 **Test Message**: Discord webhook test successful! ✅'
    };

    console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(config.discord.webhookUrl, payload);
    
    console.log('✅ Discord webhook test successful!');
    console.log('📊 Response status:', response.status);
    
  } catch (error: any) {
    console.error('❌ Discord webhook test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Payload was:', error.config?.data);
  }
}

testDiscordWebhook();