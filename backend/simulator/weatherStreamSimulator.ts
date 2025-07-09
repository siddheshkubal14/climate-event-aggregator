import { WebSocketServer } from "ws";
import fetch from "node-fetch";
import { logger } from "../utils/logger.js";


const PORT = 8765;
const INTERVAL_MS = 100; // ~10 events/sec

interface WeatherEvent {
    city: string; // City name,
    time: string; // ISO timestamp
    temperature: number; // Current temperature in °C,
    windspeed: number; // Wind speed in km/h,
    winddirection: number; // Wind direction in degrees,
}

const cities: Record<string, [number, number]> = {
    Berlin: [52.52, 13.41],
    NewYork: [40.71, -74.01],
    Tokyo: [35.68, 139.69],
    SaoPaulo: [-23.55, -46.63],
    CapeTown: [-33.92, 18.42],
};

const wss = new WebSocketServer({ port: PORT }, () => {
    logger.log("info", `🌍 Weather WebSocket server running at ws://localhost:${PORT}`);
});

/**
 * Starts the WebSocket server to simulate weather data streaming.
 * It fetches weather data from the Open Meteo API for a random city every INTERVAL_MS milliseconds.
 * If the API limit is reached, it will retry after 24 hours.
 */
wss.on("connection", (ws) => {
    logger.log("info", "🟢 Client connected");
    let apiLimitReached = false;
    let retryAfter: Date | null = null;

    const interval = setInterval(async () => {
        const now = new Date();
        if (apiLimitReached && retryAfter) {
            if (now < retryAfter) {
                logger.log("warn", `Skipping fetch: API limit reached. Retrying after ${retryAfter.toISOString()}`);
                return;
            } else {
                logger.log("info", "24 hours passed since last API limit. Retrying now...");
                apiLimitReached = false;
                retryAfter = null;
            }
        }

        const cityNames = Object.keys(cities);
        const city = cityNames[Math.floor(Math.random() * cityNames.length)];
        const [lat, lon] = cities[city];

        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
            );
            const data = await response.json() as any;

            if (data?.error || data?.reason?.includes("limit")) {
                logger.log("error", "API limit reached. Halting further fetches.");
                apiLimitReached = true;
                retryAfter = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Retry after 24 hours
                return;
            }
            const weather = data.current_weather;

            if (weather) {
                const event = {
                    city,
                    timestamp: weather.time,
                    temperature: weather.temperature,
                    windspeed: weather.windspeed,
                    winddirection: weather.winddirection,
                };
                logger.log("info", "Received message:", event);
                ws.send(JSON.stringify(event));
            }
        } catch (err: any) {
            logger.log("error", "Error fetching weather data:", err);
        }
    }, INTERVAL_MS);

    ws.on("close", () => {
        logger.log("error", "🔴 Client disconnected");
        clearInterval(interval);
    });
});


