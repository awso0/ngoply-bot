import { HashtagMonitor } from './monitor.js';

async function main() {
  console.log('🔥 Ngoply Hashtag Monitor v1.0.0');
  console.log('====================================\\n');

  const monitor = new HashtagMonitor();

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\\n📡 Received ${signal}, shutting down gracefully...`);
    try {
      await monitor.stop();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });

  try {
    await monitor.start();
    
    // Keep the process running
    setInterval(() => {
      if (!monitor.isMonitorRunning()) {
        console.log('⚠️ Monitor stopped unexpectedly, exiting...');
        process.exit(1);
      }
    }, 30000); // Check every 30 seconds

  } catch (error) {
    console.error('💥 Failed to start monitor:', error);
    process.exit(1);
  }
}

// Handle top-level async
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

export { HashtagMonitor };