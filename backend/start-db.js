const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

// Ensure data directory exists for persistence (optional, but memory server is usually ephemeral)
// To make it persistent, we need to configure it, but for now let's just get it running.

(async () => {
    const mongod = await MongoMemoryServer.create({
        instance: {
            port: 27017, // Force port 27017 to match our .env
        }
    });

    const uri = mongod.getUri();
    console.log(`MongoDB started at: ${uri}`);
    console.log('Use this connection string in your application if not using default.');
    console.log('Press Ctrl+C to stop.');

    // Keep alive
    process.on('SIGINT', async () => {
        await mongod.stop();
        process.exit(0);
    });
})();
