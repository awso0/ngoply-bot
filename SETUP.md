# 🚀 Setup Guide - Ngoply Hashtag Monitor

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Twitter Developer Account** untuk API access
3. **Discord Server** dengan webhook capability

## 🔧 Step-by-Step Setup

### 1. Twitter API Setup

1. Buka [Twitter Developer Portal](https://developer.twitter.com/)
2. Buat aplikasi baru
3. Generate Bearer Token
4. Copy token untuk configuration

### 2. Discord Webhook Setup

1. Buka Discord server Anda
2. Pergi ke **Server Settings > Integrations > Webhooks**
3. Klik **Create Webhook**
4. Set nama bot (contoh: "Ngoply Monitor")
5. Pilih channel untuk notifikasi
6. Copy Webhook URL

### 3. Environment Configuration

Edit file `.env` dan isi dengan credentials Anda:

```env
# Discord Configuration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN

# Twitter API Configuration  
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Monitoring Settings
SEARCH_HASHTAG=ngoply
CHECK_INTERVAL_MINUTES=5
MAX_TWEETS_PER_CHECK=10
ENABLE_TWITTER=true

# Bot Settings
BOT_NAME=Ngoply Monitor
NOTIFICATION_COLOR=0x00ff00
```

### 4. Installation & Running

```bash
# Install dependencies
npm install

# Build project
npm run build

# Run development mode (with auto-reload)
npm run dev

# Run production mode
npm start
```

## 🎯 Features

- ✅ **Real-time monitoring** hashtag #ngoply
- ✅ **Discord notifications** dengan embed yang indah
- ✅ **Rate limiting** untuk menghindari spam
- ✅ **Error handling** dan retry mechanism
- ✅ **Statistics tracking** dan reporting
- ✅ **Graceful shutdown** handling

## 📊 Monitoring Output

Monitor akan menampilkan:
- Status koneksi Twitter API dan Discord
- Jumlah tweets ditemukan setiap check
- Statistics lengkap (total checks, tweets, notifications)
- Error logs dan rate limiting info

## 🔒 Security Notes

- Jangan commit file `.env` ke repository
- Pastikan Discord webhook hanya diakses oleh bot
- Monitor rate limits Twitter API (300 requests per 15 menit)

## 🚀 Deployment Options

### 1. Local Machine
- Jalankan dengan `npm start`
- Gunakan PM2 untuk process management

### 2. VPS/Server
- Upload code ke server
- Install dependencies
- Setup systemd service atau PM2
- Configure firewall jika diperlukan

### 3. Cloud (Heroku, Railway, dll)
- Push ke Git repository
- Set environment variables di platform
- Deploy dan monitor logs

## 🛠️ Troubleshooting

### Error: Twitter API connection failed
- Pastikan Bearer Token valid
- Check rate limits di Twitter Developer Console
- Pastikan API permissions mencukupi

### Error: Discord webhook connection failed  
- Pastikan webhook URL benar dan valid
- Check channel permissions
- Test webhook dengan tools online

### No tweets found
- Pastikan hashtag ada dalam tweets terbaru
- Check rate limits dan API quotas
- Verify search parameters

## 📞 Support

Jika ada issues, check:
1. Console logs untuk error details
2. Twitter API status page
3. Discord API status page
4. Network connectivity