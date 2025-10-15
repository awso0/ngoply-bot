# Ngoply Hashtag Monitor

Monitor hashtag #ngoply on social media platforms and send real-time notifications to Discord.

## 🚀 Features

- ✅ Real-time hashtag monitoring
- ✅ Discord webhook notifications
- ✅ Twitter/X API integration
- ✅ Duplicate tweet prevention (tidak akan mengirim tweet yang sama dua kali)
- ✅ Automatic history cleanup
- ✅ Configurable check intervals
- ✅ TypeScript + Vite powered
- ✅ Easy deployment

## 🛠️ Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Install dependencies:
```bash
npm install
```

3. Configure your environment variables in `.env`

4. Run development server:
```bash
npm run start:dev
```

## 📦 Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run start:dev` - Run TypeScript in watch mode
- `npm run start` - Run built JavaScript
- `npm run test` - Run tests
- `npm run type-check` - Check TypeScript types

## 🔧 Environment Variables

See `.env.example` for all available configuration options.

## � Tweet History

Bot secara otomatis menyimpan history tweet yang sudah dikirim di file `tweet-history.json` untuk mencegah duplikasi. File ini akan:
- Dibuat otomatis saat pertama kali bot berjalan
- Menyimpan maksimal 1000 tweet ID terbaru
- Dibersihkan otomatis setiap 24 jam
- Tidak di-commit ke git (sudah ada di .gitignore)

Untuk mereset history (mengirim ulang semua tweet), hapus file `tweet-history.json`.

## 🧪 Testing

Test tweet history manager:
```bash
npm run build && node dist/test/test-history.js
```

## �📝 License

MIT