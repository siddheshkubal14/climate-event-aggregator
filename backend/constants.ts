export const WEBSOCKET_URL = process.env.WEBSOCKET_URL ?? "ws://localhost:8765";
export const CANDLE_INTERVAL = "hourly";
export const ERROR_MESSAGES = {
    TOO_MANY_REQUESTS: "Too many requests, please try again later.",
    UNAUTHORIZED: "Unauthorized access.",
    INTERNAL_SERVER_ERROR: "Something went wrong. Please try again.",
};