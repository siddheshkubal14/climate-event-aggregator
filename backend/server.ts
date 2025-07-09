import http from 'http';
import createApp from './app.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import config from './config.js';
import { startWebSocketClient } from './services/websocketClient.js';

if ((process.env.NODE_ENV && process.env.NODE_ENV === 'local') ||
    !process.env.NODE_ENV) {
    const result = dotenv.config();
    if (result.error) {
        throw result.error;
    }
}


/**
 * Main entry point for the server application.
 * This script initializes the Express application, sets up the HTTP server,
 * and starts the WebSocket client to listen for events.
 * 
 * @returns {Promise<void>} A promise that resolves when the server is started.
 */
createApp()
    .then(app => {
        const server = http.createServer(app);

        server.listen(config.port, () => {
            const address = server.address();
            const port = typeof address === 'string' ? address : address?.port;
            logger.log('info', `Server running at port ${port}`, null);
        });

        startWebSocketClient()
            .then(() => {
                logger.info("WebSocket client started inside server");
            })
            .catch((err: any) => {
                logger.log("error", "Failed to start WebSocket client", err);
            });

        server.on('error', (err) => {
            logger.log('error', 'Server error', err);
        });
    })
    .catch((err) => {
        logger.log('error', 'Failed to start app', err);
    });

