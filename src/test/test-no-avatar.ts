import axios from 'axios';
import { config } from '../config.js';

async function testNoAvatar() {
  console.log('🤖 Testing Discord Webhook WITHOUT Avatar...');
  console.log('============================================\n');
  
  console.log('🔧 Configuration:');
  console.log(`   Bot Name: ${config.discord.botName}`);
  console.log(`   Avatar: Disabled (using Discord default)`);
  console.log(`   Webhook URL: ${config.discord.webhookUrl ? 'Set ✅' : 'Not Set ❌'}`);
  
  try {
    const payload = {
      username: config.discord.botName,
      // No avatar_url - Discord will use default
      content: '🤖 **No Avatar Test**: Bot tanpa avatar custom - menggunakan default Discord! ✨',
      embeds: [{
        title: '🎭 No Avatar Configuration',
        description: 'Testing Discord webhook tanpa avatar custom',
        color: config.discord.notificationColor,
        fields: [
          {
            name: '🤖 Bot Name',
            value: config.discord.botName,
            inline: true
          },
          {
            name: '🎨 Avatar',
            value: 'Discord Default',
            inline: true
          },
          {
            name: '📅 Test Date',
            value: new Date().toLocaleDateString('id-ID'),
            inline: true
          }
        ],
        footer: {
          text: 'Ngoply Monitor • No Avatar Test'
          // No icon_url - using default
        },
        timestamp: new Date().toISOString()
      }]
    };

    console.log('\n📤 Sending test message (no avatar)...');
    console.log('📋 Payload preview:');
    console.log(`   username: ${payload.username}`);
    console.log(`   avatar_url: <not set>`);
    console.log(`   content: ${payload.content.substring(0, 50)}...`);
    
    const response = await axios.post(config.discord.webhookUrl, payload);
    
    console.log('\n✅ Discord webhook test successful!');
    console.log(`📊 Response status: ${response.status}`);
    console.log('🎭 Bot should appear with Discord default avatar');
    
  } catch (error: any) {
    console.error('\n❌ Discord webhook test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

testNoAvatar();