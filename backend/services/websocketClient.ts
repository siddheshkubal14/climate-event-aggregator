import WebSocket from "ws";
import { aggregateEvent } from "./aggregator.js";
import { WEBSOCKET_URL } from "../constants.js";
import { logger } from "../utils/logger.js";

let ws: WebSocket | null = null;
let attempt = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Starts the WebSocket client to connect to the weather simulator.
 * It will attempt to reconnect if the connection is lost or if an error occurs.
 *
 * @returns A promise that resolves when the WebSocket client is successfully connected.
 */
export function startWebSocketClient(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            logger.info("WebSocket client already connected");
            return resolve();
        }

        const connect = () => {
            ws = new WebSocket(WEBSOCKET_URL);

            ws.on("open", () => {
                logger.info("WebSocket connected to simulator");
                attempt = 0;
                resolve();
            });

            ws.on("message", (data: WebSocket.RawData) => {
                try {
                    logger.log("info", "Received WS event:", data.toString());
                    const event = JSON.parse(data.toString());
                    aggregateEvent(event);
                } catch (err) {
                    logger.log("error", "Error parsing message from WebSocket", err);
                }
            });

            ws.on("error", (err) => {
                logger.log("error", "WebSocket error:", err);
                if (++attempt >= MAX_RETRIES) {
                    reject(err);
                } else {
                    logger.warn(`Retrying in ${RETRY_DELAY_MS / 1000}s... [${attempt}/${MAX_RETRIES}]`);
                    setTimeout(connect, RETRY_DELAY_MS);
                }
            });

            ws.on("close", () => {
                logger.warn("⚠️ WebSocket connection closed. Reconnecting...");
                setTimeout(connect, RETRY_DELAY_MS);
            });
        };

        connect();
    });
}
