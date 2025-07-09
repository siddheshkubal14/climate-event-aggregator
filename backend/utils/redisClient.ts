import Redis from "ioredis";

/**
 * Redis client for connecting to the Redis server.
 * This client is used for storing and retrieving candlestick data.
 * The connection parameters can be configured via environment variables.
 */
export const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
});

